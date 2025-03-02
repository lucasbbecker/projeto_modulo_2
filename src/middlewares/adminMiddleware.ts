import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => { // <-- Tipo de retorno explícito
  try {
    if (!req.user) {
      res.status(401).json({ message: "Não autenticado." });
      return; // Encerra a execução
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: req.user.id },
      select: ["id", "profile"]
    });

    if (!user || user.profile !== UserProfile.ADMIN) {
      res.status(403).json({ message: "Acesso negado. Somente ADMINs." });
      return; // Encerra a execução
    }

    next(); // Libera o acesso

  } catch (error) {
    next(error); // Repassa erros
  }
};