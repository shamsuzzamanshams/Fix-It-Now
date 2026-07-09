import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";


const router = Router();

router.post(
  "/create",
  auth(UserRole.CUSTOMER),
  PaymentController.createCheckoutSession
);

// router.post(
//   "/webhook",
//   PaymentController.handleWebhook
// );

export const PaymentRoutes = router;