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

router.get(
	"/technician/:technicianId",
	availabilityController.getTechnicianAvailability
);

export const availabilityRouter = router