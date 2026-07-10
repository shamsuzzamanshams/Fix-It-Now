import { prisma } from "../../lib/prisma";
import { CategoryPayload } from "./category.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const createCategoryIntoDB = async (payload: CategoryPayload) => {
	const { name, description } = payload;
	const isExist = await prisma.category.findUnique({
		where: {
			name,
		},
	});

	if (isExist) {
		throw new AppError(httpStatus.CONFLICT, "Category already exists");
	}

	return await prisma.category.create({
		data: payload,
	});
};

const getAllCategoriesFromDB = async () => {
	const categories = await prisma.category.findMany({
		orderBy: {
			createdAt: "desc",
		},
	});

	return categories;
};



export const categoryService = {
	createCategoryIntoDB,
	getAllCategoriesFromDB
}
