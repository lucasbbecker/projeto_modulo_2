import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
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
      console.log("Iniciando processo de login...");
      console.log("Dados recebidos:", req.body);

      // Validação dos dados
      const { email, password } = loginSchema.parse(req.body);
      console.log("Email validado:", email);

      // Buscar usuário com segurança
      console.log("Buscando usuário no banco...");
      const user = await userRepository.findOne({
        where: { email },
        select: ["id", "email", "password_hash", "profile", "name"],
      });

      if (!user) {
        console.log("Usuário não encontrado para o email:", email);
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }

      console.log("Usuário encontrado:", user.id);
      console.log("Hash armazenado:", user.password_hash?.slice(0, 12) + "...");

      // Verificação de senha
      console.log("Comparando senhas...");
      const passwordMatch = await compare(password, user.password_hash);
      
      if (!passwordMatch) {
        console.log("Senha não corresponde para o usuário:", user.id);
        res.status(401).json({ message: "Credenciais inválidas" });
        return;
      }

      // Verificação do JWT_SECRET
      if (!process.env.JWT_SECRET) {
        console.error("Erro crítico: JWT_SECRET não está definido!");
        throw new Error("Variável de ambiente JWT_SECRET não configurada");
      }

      // Geração do token
      console.log("Gerando token JWT...");
      const token = sign(
        {
          id: user.id,
          profile: user.profile,
          name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      console.log("Login bem-sucedido para:", user.email);
      res.status(200).json({
        token,
        name: user.name,
        profile: user.profile
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