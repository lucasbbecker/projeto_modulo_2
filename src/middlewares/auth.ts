// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import AppError from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Token não fornecido", 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new AppError("Configuração de segurança inválida", 500);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
      profile: string;
    };

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      relations: ["driver", "branch"],
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }

    if (user.profile !== decoded.profile) {
      throw new AppError("Perfil inconsistente", 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token expirado", 401));
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Token inválido", 401));
    }

    next(error);
  }
};
