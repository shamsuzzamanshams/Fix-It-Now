import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { BookingService } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { UserRole } from "../../../generated/prisma/enums";

const createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await BookingService.createBookingIntoDB(
		req.user?.id as string,
		req.body
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "Booking created successfully",
		data: result,
	});
});

const acceptBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.acceptBookingIntoDB(
    req.user?.id as string,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking accepted successfully",
    data: result,
  });

});

const declineBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.declineBookingIntoDB(
    req.user?.id as string,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking declined successfully",
    data: result,
  });

});

const getBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.getBookingsFromDB(
    req.user?.id as string,
    req.user?.role as UserRole
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Bookings retrieved successfully",
    data: result,
  });

});

const getBookingById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.getBookingByIdFromDB(
    req.user?.id as string,
    req.user?.role as UserRole,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking retrieved successfully",
    data: result,
  });

});


const startJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.startJobIntoDB(
    req.user!.id,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job started successfully",
    data: result,
  });

});

const completeJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const result = await BookingService.completeJobIntoDB(
    req.user!.id,
    req.params.id as string
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Job completed successfully",
    data: result,
  });

});

const updateBookingStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const status = String(req.body.status || "").toUpperCase();
  let result;

  if (status === "ACCEPTED") {
    result = await BookingService.acceptBookingIntoDB(req.user!.id, req.params.id as string);
  } else if (status === "DECLINED") {
    result = await BookingService.declineBookingIntoDB(req.user!.id, req.params.id as string);
  } else if (status === "IN_PROGRESS") {
    result = await BookingService.startJobIntoDB(req.user!.id, req.params.id as string);
  } else if (status === "COMPLETED") {
    result = await BookingService.completeJobIntoDB(req.user!.id, req.params.id as string);
  } else {
    throw new Error("Invalid booking status");
  }

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Booking status updated successfully",
    data: result,
  });
});

export const bookingController = {
	createBooking,
	acceptBooking,
	declineBooking,
	getBookings,
	getBookingById,
	startJob,
	completeJob,
	updateBookingStatus
}
