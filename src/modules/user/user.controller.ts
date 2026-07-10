import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const payload = req.body;

	const user = await UserService.registerUserIntoDB(payload);


	sendResponse(res, {
		success: true,
		statusCode: httpStatus.CREATED,
		message: "User Register Successfully",
		data: { user }
	})

});

const getMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {




	const profile = await UserService.getMyProfileFromDB(req.user?.id as string)




	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User profile fetched successfully",
		data: { profile }
	})

});

const updateCustomerToTechnician = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await UserService.updateCustomerToTechnician(
			req.params.userId as string,
			req.body
		);

		sendResponse(res, {
			success: true,
			statusCode: httpStatus.CREATED,
			message: "Technician profile created successfully",
			data: result,
		});
	}
);

const updateMyProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await UserService.updateMyProfileIntoDB(
		req.user!.id,
		req.body
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Profile updated successfully",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await UserService.getAllUsersFromDB();

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "Users retrieved successfully",
		data: result,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
	const result = await UserService.updateUserStatusIntoDB(
		req.params.id as string,
		req.body.status
	);

	sendResponse(res, {
		success: true,
		statusCode: httpStatus.OK,
		message: "User status updated successfully",
		data: result,
	});
});

export const userController = {
	registerUser,
	getMyProfile,
	updateMyProfile,
	updateCustomerToTechnician,
	getAllUsers,
	updateUserStatus
}
