import express from "express";
import { UserController } from "../controllers/UserController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/auth"; 

const router = express.Router();
const userController = new UserController();

router.post(
  "/", 
  authMiddleware, 
  adminMiddleware,
  userController.createUser
);

export default router;