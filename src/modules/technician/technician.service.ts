import { prisma } from "../../lib/prisma";
import { UserRole } from "../../../generated/prisma/enums";

const technicianInclude = {
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
	services: {
		include: {
			category: true,
		},
	},
	reviews: {
		include: {
			customer: {
				omit: {
					password: true,
				},
			},
		},
	},
};

const getAllTechniciansFromDB = async (query: any = {}) => {
	const { serviceType, type, location, rating, minPrice, maxPrice } = query;
	const where: any = {};
	const selectedServiceType = serviceType || type;

	if (location) {
		where.location = {
			contains: String(location),
			mode: "insensitive",
		};
	}

	if (rating) {
		where.averageRating = {
			gte: Number(rating),
		};
	}

	if (selectedServiceType || minPrice || maxPrice) {
		const serviceFilter: any = {};

		if (selectedServiceType) {
			serviceFilter.category = {
				name: {
					contains: String(selectedServiceType),
					mode: "insensitive",
				},
			};
		}

		if (minPrice || maxPrice) {
			serviceFilter.price = {};

			if (minPrice) {
				serviceFilter.price.gte = Number(minPrice);
			}

			if (maxPrice) {
				serviceFilter.price.lte = Number(maxPrice);
			}
		}

		where.services = {
			some: serviceFilter,
		};
	}

	const technicians = await prisma.technicianProfile.findMany({
		where,
		include: technicianInclude,
		orderBy: {
			createdAt: "desc",
		},
	});

	return technicians;
};

const getTechnicianByIdFromDB = async (technicianId: string) => {
	return await prisma.technicianProfile.findUniqueOrThrow({
		where: {
			id: technicianId,
		},
		include: technicianInclude,
	});
};

const updateMyTechnicianProfileIntoDB = async (
	userId: string,
	payload: {
		bio?: string;
		experience?: number;
		location?: string;
	}
) => {
	const user = await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			role: UserRole.TECHNICIAN,
		},
	});

	return await prisma.technicianProfile.upsert({
		where: {
			userId: user.id,
		},
		create: {
			userId: user.id,
			bio: payload.bio,
			experience: Number(payload.experience || 0),
			location: payload.location || "",
		},
		update: {
			bio: payload.bio,
			experience: payload.experience === undefined ? undefined : Number(payload.experience),
			location: payload.location,
		},
		include: technicianInclude,
	});
};

export const TechnicianService = {
	getAllTechniciansFromDB,
	getTechnicianByIdFromDB,
	updateMyTechnicianProfileIntoDB,
};
