import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { availabilityController } from "./availability.controller";

const router = Router();

router.post(
	"/",
	auth(UserRole.TECHNICIAN),
	availabilityController.createAvailability
);

router.put(
	"/",
	auth(UserRole.TECHNICIAN),
	availabilityController.createAvailability
);

router.get(
	"/technician/:technicianId",
	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
	availabilityController.getTechnicianAvailability
);

export const availabilityRouter = router
