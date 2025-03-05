import { Request, Response, NextFunction } from "express";
import { UserProfile } from "../entities/User";

export const validateUserPermission = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const loggedUser = req.user;
  const userId = parseInt(req.params.id);

  if (
    !loggedUser ||
    (loggedUser.profile !== UserProfile.ADMIN &&
    loggedUser.id !== userId)
  ) {
    res.status(403).json({ message: "Acesso negado" });
    return;
  }

  next();
};