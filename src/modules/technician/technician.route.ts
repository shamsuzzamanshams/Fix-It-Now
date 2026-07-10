import express from "express";

import { TechnicianController } from "./technician.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "../booking/booking.controller";

const router = express.Router();

router.get(
	"/bookings",
	auth(UserRole.TECHNICIAN),
	bookingController.getBookings
);

router.patch(
	"/bookings/:id",
	auth(UserRole.TECHNICIAN),
	bookingController.updateBookingStatus
);

router.put(
	"/profile",
	auth(UserRole.TECHNICIAN),
	TechnicianController.updateMyProfile
);

router.get(
	"/",
	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
	TechnicianController.getAllTechnicians
);

router.get(
	"/:id",
	auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
	TechnicianController.getTechnicianById
);

export const TechnicianRoutes = router;
