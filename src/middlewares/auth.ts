// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import AppError from "../utils/AppError";

// Extensão da interface Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: User; // Mantemos o user completo
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extrair o token
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      throw new AppError("Token não fornecido", 401);
    }

    // 2. Verificar variável de ambiente
    if (!process.env.JWT_SECRET) {
      throw new AppError("Configuração de segurança inválida", 500);
    }

    // 3. Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { 
      id: number;
      profile: string; // Adicionamos o profile
    };

    // 4. Buscar usuário completo no banco
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: decoded.id },
      relations: ["driver", "branch"] // Adicione relações se necessário
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }

    // 5. Verificar se o profile do token bate com o do banco
    if (user.profile !== decoded.profile) {
      throw new AppError("Perfil inconsistente", 401);
    }

    // 6. Atribuir usuário à requisição
    req.user = user;
    next();

  } catch (error) {
    // 7. Tratamento de erros específicos
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expirado", 401));
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Token inválido", 401));
    }

    // 8. Repassar outros erros
    next(error);
  }
};