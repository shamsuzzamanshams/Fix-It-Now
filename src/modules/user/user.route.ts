import { Router } from "express";
import { userController } from "./user.controller";
import { UserRole } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/register", userController.registerUser);

router.get("/me",


	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),

	userController.getMyProfile);

router.put(
	"/me",
	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
	userController.updateMyProfile
);

router.put("/:userId", auth(UserRole.ADMIN), userController.updateCustomerToTechnician);

export const userRoute = router;
