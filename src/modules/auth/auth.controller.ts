import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
// import { authService } from "./auth.service";

import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const payload = req.body;

	const { accessToken, refreshToken } = await authService.loginUser(payload);

	res.cookie("accesstoken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24
	})

	res.cookie("refreshtoken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7
	})

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User Logged In Successfully",
		data: {
			accessToken,
			refreshToken
		}
	})
});

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const refreshToken = req.cookies.refreshtoken;

	const { accessToken } = await authService.refreshToken(refreshToken);

	res.cookie("accesstoken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24
	});

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Token Refreshed Successfully",
		data: accessToken
	})
})

export const authController = {
	loginUser,
	refreshToken,
}