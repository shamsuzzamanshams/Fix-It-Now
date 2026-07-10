import { UserRole } from "../../../generated/prisma/enums";

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: UserRole;
  bio?: string;
  experience?: number;
  location?: string;
};
