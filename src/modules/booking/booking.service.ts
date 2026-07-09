import { BookingStatus, PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createBookingIntoDB = async (
	userId: string,
	payload: {
		serviceId: string;
		bookingDate: Date;
		address: string;
		notes?: string;
	}
) => {
	// Check service exists
	const service = await prisma.service.findUniqueOrThrow({
		where: {
			id: payload.serviceId,
		},
	});

	// Create booking
	const booking = await prisma.booking.create({
		data: {
			customerId: userId,
			technicianId: service.technicianId,
			serviceId: service.id,
			bookingDate: new Date(payload.bookingDate),
			address: payload.address,
			notes: payload.notes,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			service: {
				include: {
					category: true,
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
	});

	return booking;
};



const acceptBookingIntoDB = async (
	userId: string,
	bookingId: string
) => {
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new Error("Technician profile not found");
	}

	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: {
			service: true,
			// payment: true,
		},
	});

	if (!booking) {
		throw new Error("Booking not found");
	}

	if (booking.technicianId !== technician.id) {
		throw new Error("You are not authorized to accept this booking");
	}

	if (booking.status !== BookingStatus.REQUESTED) {
		throw new Error("Booking already processed");
	}

	const result = await prisma.$transaction(async (tx) => {

		const updatedBooking = await tx.booking.update({
			where: {
				id: bookingId,
			},
			data: {
				status: BookingStatus.ACCEPTED,
			},
			include: {
				customer: {
					omit: {
						password: true,
					},
				},
				service: true,
				payment: true
			},
		});

		// Create payment only if it doesn't already exist
		// if (!booking.payment) {
		// 	await tx.payment.create({
		// 		data: {
		// 			bookingId: booking.id,
		// 			amount: booking.service.price,
		// 			status: PaymentStatus.PENDING,
		// 		},
		// 	});
		// }

		return updatedBooking;
	});

	return result;
};


const getBookingsFromDB = async (
	userId: string,
	role: UserRole
) => {

	let where = {};

	if (role === UserRole.CUSTOMER) {
		where = {
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
			throw new Error("Technician profile not found");
		}

		where = {
			technicianId: technician.id,
		};
	}

	const bookings = await prisma.booking.findMany({
		where,
		include: {
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
			service: {
				include: {
					category: true,
				},
			},
			payment: true,
			review: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return bookings;
};


export const BookingService = {
	createBookingIntoDB,
	acceptBookingIntoDB,
	getBookingsFromDB
};