import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { bookingController } from "./booking.controller";

const router = Router();

router.post(
	"/",
	auth(UserRole.CUSTOMER),
	bookingController.createBooking
);

router.put(
  "/:id/accept",
  auth(UserRole.TECHNICIAN),
  bookingController.acceptBooking
);

router.get(
  "/",
  auth(
    UserRole.ADMIN,
    UserRole.CUSTOMER,
    UserRole.TECHNICIAN
  ),
  bookingController.getBookings
);

router.patch(
  "/:id/start",
  auth(UserRole.TECHNICIAN),
  bookingController.startJob
);


router.patch(
  "/:id/complete",
  auth(UserRole.TECHNICIAN),
  bookingController.completeJob
);

export const bookingRoute = router; 