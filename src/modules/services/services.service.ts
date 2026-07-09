import { prisma } from "../../lib/prisma";

const createServiceIntoDB = async (userId: string, payload: any) => {
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new Error("Technician profile not found");
	}

	const category = await prisma.category.findUnique({
		where: {
			id: payload.categoryId,
		},
	});

	if (!category) {
		throw new Error("Category not found");
	}

	const service = await prisma.service.create({
		data: {
			title: payload.title,
			description: payload.description,
			price: payload.price,
			categoryId: payload.categoryId,
			technicianId: technician.id,
		},
		include: {
			category: true,
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

	return service;
};

const getAllServicesFromDB = async (
	type?: string,
	location?: string,
	rating?: number
) => {
	const where: any = {};

	if (type) {
		where.category = {
			name: {
				contains: type,
				mode: "insensitive",
			},
		};
	}

	if (location) {
		where.technician = {
			...(where.technician || {}),
			location: {
				contains: location,
				mode: "insensitive",
			},
		};
	}

	if (rating) {
		where.technician = {
			...(where.technician || {}),
			averageRating: {
				gte: Number(rating),
			},
		};
	}

	const services = await prisma.service.findMany({
		where,
		include: {
			category: true,
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
		orderBy: {
			createdAt: "desc",
		},
	});

	return services;
};

export const ServiceService = {
	createServiceIntoDB,
	getAllServicesFromDB,
};