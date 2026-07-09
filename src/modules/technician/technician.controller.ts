import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { TechnicianService } from "./technician.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TechnicianService.getAllTechniciansFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technicians retrieved successfully",
      data: result,
    });
  }
);

export const TechnicianController = {
  getAllTechnicians,
};