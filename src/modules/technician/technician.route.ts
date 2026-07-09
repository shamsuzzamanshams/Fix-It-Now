import express from "express";

import { TechnicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
	"/",
	// auth(UserRole.CUSTOMER, UserRole.ADMIN),
	TechnicianController.getAllTechnicians
);

export const TechnicianRoutes = router;