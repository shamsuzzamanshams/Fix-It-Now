import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, expiresIn: SignOptions) => {
	const token = jwt.sign(
		payload,
		secret,
		{
			expiresIn
		} as SignOptions);
	return token;
};

const verifiToken = (token: string, secret: string) => {
	try {
		const verifiedToken = jwt.verify(token, secret);
		return {
			success: true,
			data: verifiedToken
		}
	} catch (error: any) {
		console.log("Token Verification Faield", error);

		return {
			success: false,
			error: error.message
		}
	}
}

export const jwtUtils = {
	createToken,
	verifiToken,
};