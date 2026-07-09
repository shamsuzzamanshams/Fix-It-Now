import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ServiceService } from "./services.service";





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
	const result = await ServiceService.getAllServicesFromDB();

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Services fetched successfully",
		data: result,
	});
});


export const ServiceController = {
	createService,
	getAllServices
};