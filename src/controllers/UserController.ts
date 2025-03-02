import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User"; // Importe o enum
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import { hash } from "bcryptjs";
import { z } from "zod";

// Esquema de validação
const createUserSchema = z.object({
  name: z.string().min(1),
  profile: z.nativeEnum(UserProfile), // Use o enum no Zod
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().refine((doc) => {
    const cleanedDoc = doc.replace(/\D/g, "");
    return cleanedDoc.length === 11 || cleanedDoc.length === 14;
  }, "Documento inválido (CPF ou CNPJ)"),
  full_address: z.string().optional(),
});

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async createUser(req: Request, res: Response) {
    try {
      const body = createUserSchema.parse(req.body);

      const existingUser = await this.userRepository.findOne({ 
        where: { email: body.email } 
      });
      if (existingUser) {
        return res.status(409).json({ message: "Email já cadastrado" });
      }

      // Hash da senha
      const hashedPassword = await hash(body.password, 8);

      // Transação atômica
      const user = await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Salvar o User
        const user = await transactionalEntityManager.save(User, {
          name: body.name,
          profile: body.profile,
          email: body.email,
          password_hash: hashedPassword,
          status: true,
        });

        // Salvar Driver ou Branch
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

      return res.status(201).json({
        id: user.id,
        name: user.name,
        profile: user.profile,
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
      }
      return res.status(500).json({ message: "Erro interno" });
    }
  }
}