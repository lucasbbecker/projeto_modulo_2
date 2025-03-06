import { Request, Response, NextFunction } from "express";
import { UserProfile } from "../entities/User";
import { userService } from "../services/user.services";
import { updateUserSchema, createUserSchema } from "../schemas/userSchemas";;
import { z } from "zod";


export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const newUser = await userService.createUser(validatedData);
      
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const { profile } = req.query;
      const users = await userService.listUsers(profile as UserProfile);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro interno" });
    }
  }
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId, req.user);

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" })
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const body = updateUserSchema.parse(req.body);

      const updatedUser = await userService.updateUser(userId, body, req.user);
      res.status(200).json(updatedUser);

    } catch (error) {
      next(error);
    }
  }
  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const body = z.object({ status: z.boolean() }).parse(req.body);

      const updatedUser = await userService.updateUserStatus(
        userId,
        body.status,
        req.user
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
};