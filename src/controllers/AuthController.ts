import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User"; // Importe o enum UserProfile
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const branchRepository = AppDataSource.getRepository(Branch);
      const driverRepository = AppDataSource.getRepository(Driver);

      // Validação dos dados
      const { email, password } = loginSchema.parse(req.body);

      // Buscar usuário
      const user = await userRepository.findOne({
        where: { email },
        select: ["id", "email", "password_hash", "profile", "name"],
      });

      if (!user) {
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }

      // Verificar senha
      const passwordMatch = await compare(password, user.password_hash);
      if (!passwordMatch) {
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }

      // Buscar branchId ou driverId (se aplicável)
      let branchId: number | undefined;
      let driverId: number | undefined;

      if (user.profile === UserProfile.BRANCH) {
        const branch = await branchRepository.findOne({
          where: { user: { id: user.id } },
          select: ["id"],
        });
        branchId = branch?.id;
      } else if (user.profile === UserProfile.DRIVER) {
        const driver = await driverRepository.findOne({
          where: { user: { id: user.id } },
          select: ["id"],
        });
        driverId = driver?.id;
      }

      // Verificar JWT_SECRET
      if (!process.env.JWT_SECRET) {
        throw new Error("Variável de ambiente JWT_SECRET não configurada");
      }

      // Gerar token
      const tokenPayload: Record<string, any> = {
        id: user.id,
        profile: user.profile,
        name: user.name,
      };

      // Adicionar IDs apenas se existirem
      if (branchId) tokenPayload.branchId = branchId;
      if (driverId) tokenPayload.driverId = driverId;

      const token = sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn: "8h",
      });

      res.status(200).json({
        token,
        name: user.name,
        profile: user.profile,
      });

    } catch (error) {
      console.error("Erro durante o login:", error);

      if (error instanceof z.ZodError) {
        console.log("Erro de validação:", error.errors);
        res.status(400).json({
          message: "Dados inválidos",
          errors: error.errors,
        });
        return;
      }

      if (error instanceof Error) {
        console.error("Mensagem de erro:", error.message);
        
        // Erro específico para JWT_SECRET faltando
        if (error.message.includes("JWT_SECRET")) {
          res.status(500).json({ 
            message: "Erro de configuração do servidor",
            details: "Chave secreta não configurada" 
          });
          return;
        }
      }

      res.status(500).json({ 
        message: "Erro interno do servidor",
        details: "Ocorreu um erro inesperado" 
      });
    }
  }
}