import { BookingStatus, PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

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
	const service = await prisma.service.findUnique({
		where: {
			id: payload.serviceId,
		},
	});

	if (!service) {
		throw new AppError(httpStatus.NOT_FOUND, "Service not found");
	}

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
		throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
	}

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

	if (booking.technicianId !== technician.id) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to accept this booking");
	}

	if (booking.status !== BookingStatus.REQUESTED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Booking already processed");
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

const declineBookingIntoDB = async (
	userId: string,
	bookingId: string
) => {
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
	}

	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
	});

	if (!booking) {
		throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
	}

	if (booking.technicianId !== technician.id) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to decline this booking");
	}

	if (booking.status !== BookingStatus.REQUESTED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Booking already processed");
	}

	return await prisma.booking.update({
		where: {
			id: bookingId,
		},
		data: {
			status: BookingStatus.DECLINED,
		},
		include: bookingInclude,
	});
};

const bookingInclude = {
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
			throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
		}

		where = {
			technicianId: technician.id,
		};
	}

	const bookings = await prisma.booking.findMany({
		where,
		include: bookingInclude,
		orderBy: {
			createdAt: "desc",
		},
	});

	return bookings;
};

const getBookingByIdFromDB = async (
	userId: string,
	role: UserRole,
	bookingId: string
) => {
	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: bookingInclude,
	});

	if (!booking) {
		throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
	}

	if (role === UserRole.CUSTOMER && booking.customerId !== userId) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
	}

	if (role === UserRole.TECHNICIAN) {
		const technician = await prisma.technicianProfile.findUnique({
			where: {
				userId,
			},
		});

		if (!technician || booking.technicianId !== technician.id) {
			throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
		}
	}

	return booking;
};

const startJobIntoDB = async (
	userId: string,
	bookingId: string
) => {

	// Find technician profile
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
	}

	// Find booking
	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: {
			payment: true,
			customer: {
				omit: {
					password: true,
				},
			},
			service: true,
		},
	});

	if (!booking) {
		throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
	}

	// Check ownership
	if (booking.technicianId !== technician.id) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
	}

	// Check payment
	if (!booking.payment || booking.payment.status !== PaymentStatus.COMPLETED) {
		throw new AppError(httpStatus.BAD_REQUEST, "Customer has not completed payment");
	}

	// Booking must be PAID
	if (booking.status !== BookingStatus.PAID) {
		throw new AppError(httpStatus.BAD_REQUEST, "Booking is not ready to start");
	}

	const result = await prisma.booking.update({
		where: {
			id: bookingId,
		},
		data: {
			status: BookingStatus.IN_PROGRESS,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			service: true,
			payment: true,
		},
	});

	return result;
};




const completeJobIntoDB = async (
	userId: string,
	bookingId: string
) => {

	// Find technician profile
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
	}

	// Find booking
	const booking = await prisma.booking.findUnique({
		where: {
			id: bookingId,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			payment: true,
			service: true,
		},
	});

	if (!booking) {
		throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
	}

	// Check ownership
	if (booking.technicianId !== technician.id) {
		throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
	}

	// Ensure payment is completed
	if (booking.status !== BookingStatus.IN_PROGRESS) {
		throw new AppError(httpStatus.BAD_REQUEST, "Job has not started yet");
	}

	// Complete the job
	const result = await prisma.booking.update({
		where: {
			id: bookingId,
		},
		data: {
			status: BookingStatus.COMPLETED,
		},
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
			payment: true,
			service: true,
		},
	});

	return result;
};


export const BookingService = {
	createBookingIntoDB,
	acceptBookingIntoDB,
	declineBookingIntoDB,
	getBookingsFromDB,
	getBookingByIdFromDB,
	startJobIntoDB,
	completeJobIntoDB
};
