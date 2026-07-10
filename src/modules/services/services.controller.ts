import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./services.service";
import { UserRole } from "../../../generated/prisma/enums";





const createService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await ServiceService.createServiceIntoDB(
		req.user?.id as string,
		req.body
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Service created successfully",
		data: result,
	});
});

const getAllServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await ServiceService.getAllServicesFromDB(req.query);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Services fetched successfully",
		data: result,
	});
});

const updateService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await ServiceService.updateServiceIntoDB(
		req.user!.id,
		req.user!.role as UserRole,
		req.params.id as string,
		req.body
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Service updated successfully",
		data: result,
	});
});

export const ServiceController = {
	createService,
	getAllServices,
	updateService
};
