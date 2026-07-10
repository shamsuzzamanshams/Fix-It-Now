import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createServiceIntoDB = async (userId: string, payload: any) => {
	const technician = await prisma.technicianProfile.findUnique({
		where: {
			userId,
		},
	});

	if (!technician) {
		throw new AppError(httpStatus.NOT_FOUND, "Technician profile not found");
	}

	const category = await prisma.category.findUnique({
		where: {
			id: payload.categoryId,
		},
	});

	if (!category) {
		throw new AppError(httpStatus.NOT_FOUND, "Category not found");
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

const getAllServicesFromDB = async (query: any = {}) => {
	const { type, category, location, rating, minPrice, maxPrice } = query;
	const where: any = {};

	const serviceType = type || category;

	if (serviceType) {
		where.category = {
			name: {
				contains: String(serviceType),
				mode: "insensitive",
			},
		};
	}

	if (location) {
		where.technician = {
			...(where.technician || {}),
			location: {
				contains: String(location),
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

	if (minPrice || maxPrice) {
		where.price = {};

		if (minPrice) {
			where.price.gte = Number(minPrice);
		}

		if (maxPrice) {
			where.price.lte = Number(maxPrice);
		}
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

const updateServiceIntoDB = async (
	userId: string,
	role: string,
	serviceId: string,
	payload: any
) => {
	const service = await prisma.service.findUnique({
		where: {
			id: serviceId,
		},
		include: {
			technician: true,
		},
	});

	if (!service) {
		throw new AppError(httpStatus.NOT_FOUND, "Service not found");
	}

	if (role !== "ADMIN") {
		const technician = await prisma.technicianProfile.findUnique({
			where: {
				userId,
			},
		});

		if (!technician || service.technicianId !== technician.id) {
			throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this service");
		}
	}

	if (payload.categoryId) {
		const category = await prisma.category.findUnique({
			where: {
				id: payload.categoryId,
			},
		});

		if (!category) {
			throw new AppError(httpStatus.NOT_FOUND, "Category not found");
		}
	}

	return await prisma.service.update({
		where: {
			id: serviceId,
		},
		data: {
			title: payload.title,
			description: payload.description,
			price: payload.price === undefined ? undefined : Number(payload.price),
			categoryId: payload.categoryId,
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
};

export const ServiceService = {
	createServiceIntoDB,
	getAllServicesFromDB,
	updateServiceIntoDB,
};
