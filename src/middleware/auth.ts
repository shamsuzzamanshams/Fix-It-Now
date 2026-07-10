import { NextFunction, Request, Response } from "express";

import { catchAsync } from "../utils/catchAsync";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";
import { jwtUtils } from "../utils/jwt";

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
			req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			throw new Error("Unauthorized");
		}

		const verified = jwtUtils.verifiToken(
			token,
			config.jwt_access_secret
		);

		if (!verified.success) {
			throw new Error(verified.error);
		}

		const { id } = verified.data as JwtPayload;

		const user = await prisma.user.findUnique({
			where: { id },
		});

		if (!user) {
			throw new Error("User not found");
		}

		if (requiredRole.length && !requiredRole.includes(user.role!)) {
			throw new Error("Forbidden");
		}

		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role!,
		};

		next();
	})


}