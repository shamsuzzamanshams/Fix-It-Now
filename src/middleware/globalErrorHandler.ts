import { ErrorRequestHandler } from "express";
import httpStatus from "http-status";
import AppError from "../errors/AppError";

export const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
	const errorCode = typeof error === "object" && error !== null && "code" in error
		? String(error.code)
		: undefined;

	const statusCode =
		error instanceof AppError
			? error.statusCode
			: errorCode === "P2025"
				? httpStatus.NOT_FOUND
				: errorCode === "P2002"
					? httpStatus.CONFLICT
					: error instanceof Error
						? httpStatus.BAD_REQUEST
						: httpStatus.INTERNAL_SERVER_ERROR;

	res.status(statusCode).json({
		success: false,
		statusCode,
		message:
			error instanceof Error
				? error.message
				: "Something went wrong",
	});
};
