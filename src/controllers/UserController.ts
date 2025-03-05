import { Request, Response } from "express";
import { UserProfile } from "../entities/User";
import { userService } from "../services/user.services";
import { updateUserSchema, createUserSchema } from "../schemas/userSchemas";;
import { z } from "zod";


export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const newUser = await userService.createUser(validatedData);
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Erro na criação de usuário:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
      } 
      else if (error instanceof Error && error.message === "Email já cadastrado") {
        res.status(409).json({ message: error.message });
      } 
      else {
        res.status(500).json({ message: "Erro interno no servidor" });
      }
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
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const user = await userService.getUserById(userId, req.user);

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" })
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro interno" });
    }
  }
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const body = updateUserSchema.parse(req.body);

      const updatedUser = await userService.updateUser(userId, body, req.user);
      res.status(200).json(updatedUser);

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else if (error instanceof Error && error.message === "Acesso negado") {
        res.status(403).json({ message: "Acesso negado" });
      } else if (error instanceof Error && error.message === "Usuário não encontrado") {
        res.status(404).json({ message: "Usuário não encontrado" });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  }
  async updateUserStatus(req: Request, res: Response): Promise<void> {
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
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else if (error instanceof Error && error.message === "Acesso negado") {
        res.status(403).json({ message: "Acesso negado" });
      } else if (error instanceof Error && error.message === "Usuário não encontrado") {
        res.status(404).json({ message: "Usuário não encontrado" });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  }
};