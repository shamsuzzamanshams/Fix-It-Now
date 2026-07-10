import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleCheckoutCompleted } from "./payment.utils";
import { UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createCheckoutSessionIntoDB = async (
	userId: string,
	bookingId: string
) => {

	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: {
			service: true,
			payment: true,
		},
	});

	if (!booking) {
		throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
	}

	if (booking.customerId !== userId) {
		throw new AppError(httpStatus.FORBIDDEN, "Unauthorized");
	}

	if (booking.status !== "ACCEPTED") {
		throw new AppError(httpStatus.BAD_REQUEST, "Booking is not accepted");
	}

	if (
		booking.payment &&
		booking.payment.status === "COMPLETED"
	) {
		throw new AppError(httpStatus.BAD_REQUEST, "Payment already completed");
	}

	const session = await stripe.checkout.sessions.create({
		mode: "payment",

		payment_method_types: ["card"],

		client_reference_id: booking.id,

		line_items: [
			{
				price_data: {
					currency: "bdt",
					product_data: {
						name: booking.service.title,
						description: booking.service.description,
					},
					unit_amount: Math.round(booking.service.price * 100),
				},
				quantity: 1,
			},
		],

		metadata: {
			bookingId: booking.id,
			customerId: booking.customerId,
			technicianId: booking.technicianId,
		},

		success_url: `${config.app_url}/payment?success=true`,
		cancel_url: `${config.app_url}/payment?success=false`,
	});

	await prisma.payment.upsert({
		where: {
			bookingId: booking.id,
		},
		create: {
			bookingId: booking.id,
			amount: booking.service.price,
			transactionId: session.id,
			method: "STRIPE",
		},
		update: {
			transactionId: session.id,
			method: "STRIPE",
		},
	});

	return {
		paymentUrl: session.url,
	};
};

const handleWebhookIntoDB = async (
	payload: Buffer,
	signature: string
) => {

	const event = stripe.webhooks.constructEvent(
		payload,
		signature,
		config.stripe_webhook_secret
	);

	switch (event.type) {

		case "checkout.session.completed":

			await handleCheckoutCompleted(event.data.object);

			break;

		default:
			console.log(event.type);
	}

};

const paymentInclude = {
	booking: {
		include: {
			service: {
				include: {
					category: true,
				},
			},
			customer: {
				omit: {
					password: true,
				},
			},
			technician: {
				include: {
					user: {
						omit: {
							password: true,
						},
					},
				},
			},
		},
	},
};

const getPaymentsFromDB = async (userId: string, role: UserRole) => {
	const where: any = {};

	if (role === UserRole.CUSTOMER) {
		where.booking = {
			customerId: userId,
		};
	}

	if (role === UserRole.TECHNICIAN) {
		const technician = await prisma.technicianProfile.findUnique({
			where: {
				userId,
			},
		});

		if (!technician) {
			throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
		}

		where.booking = {
			technicianId: technician.id,
		};
	}

	return await prisma.payment.findMany({
		where,
		include: paymentInclude,
		orderBy: {
			createdAt: "desc",
		},
	});
};

const getPaymentByIdFromDB = async (
	userId: string,
	role: UserRole,
	paymentId: string
) => {
	const payment = await prisma.payment.findUnique({
		where: {
			id: paymentId,
		},
		include: paymentInclude,
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
	}

	if (role === UserRole.CUSTOMER && payment.booking.customerId !== userId) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
	}

	if (role === UserRole.TECHNICIAN) {
		const technician = await prisma.technicianProfile.findUnique({
			where: {
				userId,
			},
		});

		if (!technician || payment.booking.technicianId !== technician.id) {
			throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
		}
	}

	return payment;
};

export const PaymentService = {
	createCheckoutSessionIntoDB,
	handleWebhookIntoDB,
	getPaymentsFromDB,
	getPaymentByIdFromDB,
};
