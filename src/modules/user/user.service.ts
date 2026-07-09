import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { RegisterUserPayload } from "./user.interface";
import { UserRole } from "../../../generated/prisma/enums";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
	const {
		name,
		email,
		password,
		phone,
		address,
	} = payload;

	const isUserExist = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	if (isUserExist) {
		throw new Error("User with this email already exists");
	}

	const hashPassword = await bcrypt.hash(
		password,
		Number(config.bcrypt_salt_rounds)
	);

	const createdUser = await prisma.user.create({
		data: {
			name,
			email,
			password: hashPassword,
			phone,
			address,
		},
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
	throw new Error("User not found");
  }

  if (user.technicianProfile) {
	throw new Error("Technician profile already exists");
  }

  await prisma.user.update({
	where: {
	  id: userId,
	  name: user.name,
	  phone: user.phone
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

export const UserService = {
	registerUserIntoDB,
	getMyProfileFromDB,
	updateCustomerToTechnician
};