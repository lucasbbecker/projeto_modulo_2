// src/routes/authRoutes.ts
import express from "express";
import { AuthController } from "../controllers/AuthController";

const router = express.Router();
const authController = new AuthController();

router.post("/", authController.login);

export default router;