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
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Não autenticado." });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id: req.user.id },
      select: ["id", "profile"]
    });

    if (!user || user.profile !== UserProfile.ADMIN) {
      res.status(403).json({ message: "Acesso negado. Somente ADMINs." });
      return;
    }

    next();

  } catch (error) {
    next(error);
  }
};