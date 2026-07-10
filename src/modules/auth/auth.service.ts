import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";

const loginUser = async (payload: ILoginUser) => {

	const { email, password } = payload;

	const user = await prisma.user.findUnique({
		where: { email }
	})

	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	if (user.status === UserStatus.BANNED) {
		throw new AppError(httpStatus.FORBIDDEN, "Your account is banned");
	}

	const isPasswordMatched = await bcrypt.compare(password, user.password);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	const jwtpayload = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	}

	// const accessToken = jwt.sign(jwtpayload, config.jwt_access_secret,
	// 	{
	// 		expiresIn: config.jwt_access_expires_in
	// 	} as SignOptions);

	const accessToken = jwtUtils.createToken(
		jwtpayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions["expiresIn"]
	)

	// const refreshToken = jwt.sign(jwtpayload, config.jwt_refresh_secret,
	// 	{
	// 		expiresIn: config.jwt_refresh_expires_in
	// 	} as SignOptions);

	const refreshToken = jwtUtils.createToken(
		jwtpayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions["expiresIn"]
	)




	return {
		accessToken,
		refreshToken
	};

};

const refreshToken = async (refreshToken: string) => {
	if (!refreshToken) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
	}

	const verifiedRefreshToken = jwtUtils.verifiToken(refreshToken, config.jwt_refresh_secret);

	if (!verifiedRefreshToken.success) {
		throw new AppError(httpStatus.UNAUTHORIZED, verifiedRefreshToken.error);
	}

	const { id } = verifiedRefreshToken.data as JwtPayload;

	if (!id) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
	}

	const user = await prisma.user.findUnique({
		where: {
			id
		}
	})

	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
	}

	if (user.status === UserStatus.BANNED) {
		throw new AppError(httpStatus.FORBIDDEN, "Your account is banned");
	}

	

	const jwtpayload = {
		id,
		name: user.name,
		email: user.email,
		role: user.role
	};

	const accessToken = jwtUtils.createToken(
		jwtpayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions["expiresIn"]
	)

	return { accessToken };


};



export const authService = {
	loginUser,
	refreshToken,
}
