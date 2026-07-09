import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";


const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const result = await PaymentService.createCheckoutSessionIntoDB(
      req.user!.id,
      req.body.bookingId
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });

  }
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const payload = req.body as Buffer;
    const signature = req.headers["stripe-signature"]!;

    await PaymentService.handleWebhookIntoDB(
      payload,
      signature as string
    );

     sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: {}
    });

    
  }
);

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
};