import express from "express";
import { productsController } from "../controllers/ProductController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  productsController.createProduct
);

export default router;