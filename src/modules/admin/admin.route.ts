import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { userController } from "../user/user.controller";
import { bookingController } from "../booking/booking.controller";
import { categoryController } from "../catrgory/category.controller";

const router = Router();

router.get("/users", auth(UserRole.ADMIN), userController.getAllUsers);
router.patch("/users/:id", auth(UserRole.ADMIN), userController.updateUserStatus);
router.get("/bookings", auth(UserRole.ADMIN), bookingController.getBookings);
router.get("/categories", auth(UserRole.ADMIN), categoryController.getAllCategories);
router.post("/categories", auth(UserRole.ADMIN), categoryController.createCategory);

export const AdminRoutes = router;
