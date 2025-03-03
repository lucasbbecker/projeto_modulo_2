import express from "express";
import { movementsController } from "../controllers/movementsController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  movementsController.createMovement
);

export default router;