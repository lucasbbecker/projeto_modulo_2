import { Request, Response } from "express";
import { createMovementSchema } from "../schemas/movementSchema";
import { movementService } from "../services/movement.services";
import { UserProfile } from "../entities/User";
import { z } from "zod";

export const movementsController = {
  async createMovement(req: Request, res: Response): Promise<void> {
    try {
      const body = createMovementSchema.parse(req.body);
      
      if (!req.user || req.user.profile !== UserProfile.BRANCH || !req.user.branch.id) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }

      const movement = await movementService.createMovement({
        ...body,
        source_branch_id: req.user.branch.id,
      });

      res.status(201).json(movement);

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: (error as z.ZodError).errors });
      } else if (error instanceof Error && error.message === "Produto não encontrado na filial de origem") {
        res.status(404).json({ message: error.message });
      } else if (error instanceof Error && error.message === "Estoque insuficiente") {
        res.status(400).json({ message: error.message });
      } else if (error instanceof Error && error.message === "Filial de destino não encontrada") {
        res.status(404).json({ message: error.message });
      } else if (error instanceof Error && error.message === "Filial de destino inválida") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },
};
