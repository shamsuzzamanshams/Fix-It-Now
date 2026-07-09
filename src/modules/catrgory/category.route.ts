import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

const router = Router();

router.post(
	"/",
	auth(UserRole.ADMIN),
	categoryController.createCategory
);

router.get("/", categoryController.getAllCategories);

export const categoryRoute = router;