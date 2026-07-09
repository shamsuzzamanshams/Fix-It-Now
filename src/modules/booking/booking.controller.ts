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

export const bookingController = {
	createBooking,
	acceptBooking,
	getBookings
}