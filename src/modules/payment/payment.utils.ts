import Stripe from "stripe";
// import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";

export const handleCheckoutCompleted = async (
	session: Stripe.Checkout.Session
) => {

	const bookingId = session.metadata?.bookingId;

	if (!bookingId) {
		return;
	}

	await prisma.$transaction(async (tx) => {
		await tx.payment.upsert({
			where: {
				bookingId,
			},
			create: {
				bookingId,
				amount: session.amount_total! / 100,
				transactionId: session.payment_intent as string,
				method: "STRIPE",
				status: PaymentStatus.COMPLETED,
				paidAt: new Date(),
			},
			update: {
				transactionId: session.payment_intent as string,
				method: "STRIPE",
				status: PaymentStatus.COMPLETED,
				paidAt: new Date(),
			},
		});

		await tx.booking.update({
			where: {
				id: bookingId,
			},
			data: {
				status: BookingStatus.PAID,
			},
		});
	});

};
