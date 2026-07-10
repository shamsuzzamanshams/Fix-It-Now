import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { TechnicianService } from "./technician.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getAllTechnicians = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TechnicianService.getAllTechniciansFromDB(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technicians retrieved successfully",
      data: result,
    });
  }
);

const getTechnicianById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TechnicianService.getTechnicianByIdFromDB(req.params.id as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician retrieved successfully",
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await TechnicianService.updateMyTechnicianProfileIntoDB(
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile saved successfully",
      data: result,
    });
  }
);

export const TechnicianController = {
  getAllTechnicians,
  getTechnicianById,
  updateMyProfile,
};
