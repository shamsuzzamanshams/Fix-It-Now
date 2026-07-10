import { Router } from "express";
import { authController } from "./auth.controller";
import { userController } from "../user/user.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", userController.registerUser);
router.post("/login", authController.loginUser);
router.get("/me", auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN), userController.getMyProfile);

router.post("/refresh-token",authController.refreshToken);

export const authRoute = router;
