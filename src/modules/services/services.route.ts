import express from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { ServiceController } from "./services.controller";


const router = express.Router();

router.post(
	"/",
	auth(UserRole.ADMIN,UserRole.TECHNICIAN),
	ServiceController.createService
);

// Customer, Admin and Technician can browse services
router.get(
	"/",
	auth(UserRole.CUSTOMER, UserRole.ADMIN),
	ServiceController.getAllServices
);

export const ServiceRoutes = router;