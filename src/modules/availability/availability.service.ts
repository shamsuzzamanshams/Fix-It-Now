import { prisma } from "../../lib/prisma";

const createAvailabilityIntoDB = async (
	userId: string,
	payload: {
		date: Date;
		startTime: Date;
		endTime: Date;
	}
) => {
	const technician = await prisma.technicianProfile.findUniqueOrThrow({
		where: {
			userId,
		},
	});

	const availability = await prisma.availability.create({
		data: {
			technicianId: technician.id,
			date: new Date(payload.date),
			startTime: new Date(payload.startTime),
			endTime: new Date(payload.endTime),
		},
	});

	return availability;
};


const getTechnicianAvailabilityFromDB = async (technicianId: string) => {
	return await prisma.availability.findMany({
		where: {
			technicianId,
			isBooked: false,
		},
		orderBy: {
			date: "asc",
		},
	});
};

export const AvailabilityService = {
	createAvailabilityIntoDB,
	getTechnicianAvailabilityFromDB,
};