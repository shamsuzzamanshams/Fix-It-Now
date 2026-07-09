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
		const token = req.cookies.accesstoken ? req.cookies.accesstoken
			:
			req.headers.authorization?.startsWith("Bearer") ?
				req.headers.authorization?.split(" ")[1] 
				: req.headers.authorization

		if (!token) {
			throw new Error("You are not logged in. please log in access resource");
		}
		const verifiedToken = jwtUtils.verifiToken(token, config.jwt_access_secret);

		if (!verifiedToken.success) {
			throw new Error(verifiedToken.error);
		}

		const { name, email, id, role } = verifiedToken.data as JwtPayload;

		if (requiredRole.length && !requiredRole.includes(role)) {
			throw new Error("Forbidden. You don't have permission to access this resources");
		}

		const user = await prisma.user.findUnique({
			where: {
				id,
				email,
				name,
				role
			}
		})

		if (!user) {
			throw new Error("User not found. please log in again");
		}

		req.user = {
			email,
			name,
			id,
			role
		}

		next();
	})


}