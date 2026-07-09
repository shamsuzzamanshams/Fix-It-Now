import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AvailabilityService } from "./availability.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await AvailabilityService.createAvailabilityIntoDB(
		req.user?.id as string,
		req.body
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Availability created successfully",
		data: result,
	});
});

const getTechnicianAvailability = catchAsync(async (req, res) => {
	const result = await AvailabilityService.getTechnicianAvailabilityFromDB(
		req.params.technicianId as string
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Availability fetched successfully",
		data: result,
	});
});

export const availabilityController = {
	createAvailability,
	getTechnicianAvailability
}