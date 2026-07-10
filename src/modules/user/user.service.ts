import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";
import { UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
	const {
		name,
		email,
		password,
		phone,
		address,
		role,
	} = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist) {
		throw new AppError(httpStatus.CONFLICT, "User with this email already exists");
	}

	const hashPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds)
	);

	if (role === UserRole.ADMIN) {
		throw new AppError(httpStatus.BAD_REQUEST, "Admin registration is not allowed");
	}

	const createdUser = await prisma.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				name,
				email,
				password: hashPassword,
				phone,
				address,
				role: role || UserRole.CUSTOMER,
			},
		});

		if (role === UserRole.TECHNICIAN) {
			if (payload.experience === undefined || !payload.location) {
				throw new AppError(httpStatus.BAD_REQUEST, "Technician experience and location are required");
			}

			await tx.technicianProfile.create({
				data: {
					userId: user.id,
					bio: payload.bio,
					experience: Number(payload.experience),
					location: payload.location,
				},
			});
		}

		return user;
	});

	const user = await prisma.user.findUnique({
		where: {
			id: createdUser.id,
		},
		omit: {
			password: true,
		},
	});

	return user;
};

const getMyProfileFromDB = async (userId: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId,
		},
		omit: {
			password: true,
		}
	});

	return user;
};

const updateMyProfileIntoDB = async (
	userId: string,
	payload: {
		name?: string;
		phone?: string;
		address?: string;
	}
) => {
	return await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			name: payload.name,
			phone: payload.phone,
			address: payload.address,
		},
		omit: {
			password: true,
		},
	});
};

const updateCustomerToTechnician =  async (
  userId: string,
  payload: {
	bio: string;
	experience: number;
	location: string;
  }
) => {
  const user = await prisma.user.findUnique({
	where: {
	  id: userId,
	},
	include: {
	  technicianProfile: true,
	},
  });

	if (!user) {
	throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.technicianProfile) {
	throw new AppError(httpStatus.CONFLICT, "Technician profile already exists");
  }

  await prisma.user.update({
	where: {
	  id: userId,
	},
	data: {
	  role: UserRole.TECHNICIAN,
	},
  });

  const technician = await prisma.technicianProfile.create({
	data: {
	  userId,
	  bio: payload.bio,
	  experience: payload.experience,
	  location: payload.location,
	},
  });

  return technician;
};

const getAllUsersFromDB = async () => {
	return await prisma.user.findMany({
		omit: {
			password: true,
		},
		include: {
			technicianProfile: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
};

const updateUserStatusIntoDB = async (
	userId: string,
	status: "ACTIVE" | "BANNED"
) => {
	return await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			status,
		},
		omit: {
			password: true,
		},
	});
};

export const UserService = {
	registerUserIntoDB,
	getMyProfileFromDB,
	updateMyProfileIntoDB,
	updateCustomerToTechnician,
	getAllUsersFromDB,
	updateUserStatusIntoDB
};
