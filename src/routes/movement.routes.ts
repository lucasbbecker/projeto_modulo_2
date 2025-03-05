import express from "express";
import { movementsController } from "../controllers/MovementsController";
import { authMiddleware } from "../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  movementsController.createMovement
);

router.get(
  "/",
  authMiddleware,
  movementsController.listMovements
)

router.patch(
  "/:id/start",
  authMiddleware,
  movementsController.startMovement
);

router.patch(
  "/:id/end",
  authMiddleware,
  movementsController.endMovement
);

export default router;