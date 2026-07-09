import { prisma } from "../../lib/prisma";

const getAllTechniciansFromDB = async () => {
	const technicians = await prisma.technicianProfile.findMany({
		include: {
			user: {
				omit: {
					password: true,
				},
			},
			availability: {
				select: {
					date: true,
					startTime: true,
					endTime: true,
					isBooked: true,
				}
			},
			services: true,
			reviews: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return technicians;
};

export const TechnicianService = {
	getAllTechniciansFromDB,
};