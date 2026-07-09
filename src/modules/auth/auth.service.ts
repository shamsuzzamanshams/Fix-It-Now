import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser } from "./auth.interface";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUser = async (payload: ILoginUser) => {

	const { email, password } = payload;

	const user = await prisma.user.findFirstOrThrow({
		where: { email }
	})

	const isPasswordMatched = await bcrypt.compare(password, user.password);

	if (!isPasswordMatched) {
		throw new Error("Password Is Incorrect");
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
		config.jwt_access_expires_in as SignOptions
	)

	// const refreshToken = jwt.sign(jwtpayload, config.jwt_refresh_secret,
	// 	{
	// 		expiresIn: config.jwt_refresh_expires_in
	// 	} as SignOptions);

	const refreshToken = jwtUtils.createToken(
		jwtpayload,
		config.jwt_refresh_secret,
		config.jwt_refresh_expires_in as SignOptions
	)




	return {
		accessToken,
		refreshToken
	};

};

const refreshToken = async (refreshToken: string) => {
	const verifiedRefreshToken = jwtUtils.verifiToken(refreshToken, config.jwt_refresh_secret);

	if (!verifiedRefreshToken.success) {
		throw new Error(verifiedRefreshToken.error);
	}

	const { id } = verifiedRefreshToken.data as JwtPayload;

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id
		}
	})

	

	const jwtpayload = {
		id,
		name: user.name,
		email: user.email,
		role: user.role
	};

	const accessToken = jwtUtils.createToken(
		jwtpayload,
		config.jwt_access_secret,
		config.jwt_access_expires_in as SignOptions
	)

	return { accessToken };


};



export const authService = {
	loginUser,
	refreshToken,
}