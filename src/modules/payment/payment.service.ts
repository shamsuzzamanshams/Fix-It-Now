import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { handleCheckoutCompleted } from "./payment.utils";

const createCheckoutSessionIntoDB = async (
	userId: string,
	bookingId: string
) => {

	const booking = await prisma.booking.findUniqueOrThrow({
		where: {
			id: bookingId,
		},
		include: {
			service: true,
			payment: true,
		},
	});

	if (booking.customerId !== userId) {
		throw new Error("Unauthorized");
	}

	if (booking.status !== "ACCEPTED") {
		throw new Error("Booking is not accepted");
	}

	if (
		booking.payment &&
		booking.payment.status === "COMPLETED"
	) {
		throw new Error("Payment already completed");
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

export const PaymentService = {
	createCheckoutSessionIntoDB,
	handleWebhookIntoDB,
};