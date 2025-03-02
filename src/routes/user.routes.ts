import "express-async-errors";
import express from "express";
import { UserController } from "../controllers/UserController";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import { authMiddleware } from "../middlewares/auth"; 

const router = express.Router();
const userController = new UserController();

// Rota POST /users (acessível apenas por ADMIN)
router.post(
  "/users", 
  authMiddleware, 
  adminMiddleware, 
  userController.createUser.bind
);

export default router;