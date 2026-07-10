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

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
	ServiceController.getAllServices
);

router.put(
	"/:id",
	auth(UserRole.ADMIN, UserRole.TECHNICIAN),
	ServiceController.updateService
);

export const ServiceRoutes = router;
