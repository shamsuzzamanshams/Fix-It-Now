import { NextFunction, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { UserRole, UserStatus } from "../../generated/prisma/enums";
import { jwtUtils } from "../utils/jwt";
import AppError from "../errors/AppError";
import httpStatus from "http-status";

declare global {
	namespace Express {
		interface Request {
			user?: {
				email: string;
				name: string;
				id: string;
				role: UserRole
			}
		}
	}
}

export const auth = (...requiredRole: UserRole[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token =
			req.cookies.accesstoken ||
			req.cookies.accessToken ||
			req.headers.authorization?.replace(/^Bearer\s+/i, "");

		if (!token) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		const verified = jwtUtils.verifyToken(
			token,
			config.jwt_access_secret
		);

		if (!verified.success) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		const { id } = verified.data as JwtPayload;

		if (!id) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user");
		}

		if (user.status === UserStatus.BANNED) {
			throw new AppError(httpStatus.FORBIDDEN, "Your account is banned");
		}

		if (!user.role || (requiredRole.length && !requiredRole.includes(user.role))) {
			throw new AppError(httpStatus.FORBIDDEN, "Forbidden");
		}

		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		};

		next();
	})


}
