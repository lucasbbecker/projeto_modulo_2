import express from "express";
import { UserController } from "../controllers/UserController";
import { validateUserPermission } from "../middlewares/validateUserPermission";
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

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  userController.listUsers
);

router.get(
  "/:id",
  authMiddleware,              
  validateUserPermission,
  userController.getUserById
);

router.put(
  "/:id",
  authMiddleware,
  validateUserPermission,
  userController.updateUser
);

router.patch(
  "/:id/status",
  authMiddleware,       
  adminMiddleware,
  userController.updateUserStatus
);

export default router;