import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";
import { userService } from "../services/user.services";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import { hash } from "bcryptjs";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  profile: z.nativeEnum(UserProfile),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().refine((doc) => {
    const cleanedDoc = doc.replace(/\D/g, "");
    return cleanedDoc.length === 11 || cleanedDoc.length === 14;
  }, "Documento inválido (CPF ou CNPJ)"),
  full_address: z.string().optional(),
});

export class UserController {
  

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      console.log("Iniciando criação de usuário...");
      const body = createUserSchema.parse(req.body);
  
      console.log("Verificando email existente...");
      const existingUser = await userRepository.findOne({ 
        where: { email: body.email } 
      });
  
      if (existingUser) {
        console.log("Email já existe:", body.email);
        res.status(409).json({ message: "Email já cadastrado" });
        return;
      }
  
      console.log("Gerando hash da senha...");
      const hashedPassword = await hash(body.password, 8);
  
      console.log("Iniciando transação...");
      const user = await AppDataSource.transaction(async (transactionalEntityManager) => {
        console.log("Salvando usuário...");
        const user = await transactionalEntityManager.save(User, {
          name: body.name,
          profile: body.profile,
          email: body.email,
          password_hash: hashedPassword,
          status: true,
        });
  
        console.log("Salvando perfil específico...");
        if (body.profile === UserProfile.DRIVER) {
          await transactionalEntityManager.save(Driver, {
            full_address: body.full_address,
            document: body.document,
            user: user,
          });
        } else if (body.profile === UserProfile.BRANCH) {
          await transactionalEntityManager.save(Branch, {
            full_address: body.full_address,
            document: body.document,
            user: user,
          });
        }
  
        return user;
      });
  
      console.log("Usuário criado com sucesso:", user.id);
      res.status(201).json({
        id: user.id,
        name: user.name,
        profile: user.profile,
      });
  
    } catch (error) {
      console.error("Erro:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
      } else {
        res.status(500).json({ message: "Erro interno" });
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
};