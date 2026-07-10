import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  PaymentController.getPayments
);

router.post(
  "/create",
  auth(UserRole.CUSTOMER),
  PaymentController.createCheckoutSession
);

router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.TECHNICIAN),
  PaymentController.getPaymentById
);

// router.post(
//   "/webhook",
//   PaymentController.handleWebhook
// );

export const PaymentRoutes = router;
