import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { TechnicianRoutes } from "./modules/technician/technician.route";
import { ServiceRoutes } from "./modules/services/services.route";
import { categoryRoute } from "./modules/catrgory/category.route";
import { bookingRoute } from "./modules/booking/booking.route";
import { availabilityRouter } from "./modules/availability/availability.route";
import { PaymentRoutes } from "./modules/payment/payment.route";
import { PaymentController } from "./modules/payment/payment.controller";
import { ReviewRoutes } from "./modules/review/review.route";

const app: Application = express();

app.use(cors({
	origin: config.app_url,
	credentials: true
}));






app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleWebhook
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {

	res.send('Hello World!');
});

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/technicians", TechnicianRoutes);
app.use("/api/services", ServiceRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/book", bookingRoute);
app.use("/api/availability", availabilityRouter);
app.use("/api/payment", PaymentRoutes);
app.use("/api/reviews", ReviewRoutes);

export default app;