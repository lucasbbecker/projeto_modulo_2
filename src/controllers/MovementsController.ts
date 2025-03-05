import { Request, Response } from "express";
import { Movement, MovementStatus } from "../entities/Movement"; // Add this line to import the Movement type
import {
  createMovementSchema,
  listMovementsSchema,
} from "../schemas/movementSchema";
import { movementService } from "../services/movement.services";
import { UserProfile } from "../entities/User";
import { z } from "zod";

export const movementsController = {
  async createMovement(req: Request, res: Response): Promise<void> {
    try {
      const body = createMovementSchema.parse(req.body);

      if (
        !req.user ||
        req.user.profile !== UserProfile.BRANCH ||
        !req.user.branch.id
      ) {
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
        res.status(400).json({
          message: "Dados inválidos",
          errors: (error as z.ZodError).errors,
        });
      } else if (
        error instanceof Error &&
        error.message === "Produto não encontrado na filial de origem"
      ) {
        res.status(404).json({ message: error.message });
      } else if (
        error instanceof Error &&
        error.message === "Estoque insuficiente"
      ) {
        res.status(400).json({ message: error.message });
      } else if (
        error instanceof Error &&
        error.message === "Filial de destino não encontrada"
      ) {
        res.status(404).json({ message: error.message });
      } else if (
        error instanceof Error &&
        error.message === "Filial de destino inválida"
      ) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },
  listMovements: async (req: Request, res: Response): Promise<void> => {
    try {
      const query = listMovementsSchema.parse(req.query);
      let movements: Movement[];
  
      if (!req.user) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }
      if (req.user.profile === UserProfile.DRIVER && query.status === MovementStatus.PENDING) {
        res.status(400).json({ 
          message: "Motoristas só podem visualizar movimentações em andamento ou finalizadas" 
        });
        return;
      }
  
      switch (req.user.profile) {
        case UserProfile.BRANCH:
          if (!req.user.branch.id) {
            res.status(403).json({ message: "Acesso negado" });
            return;
          }
          movements = await movementService.listMovementsByBranch(
            req.user.branch.id,
            query.status
          );
          break;
  
        case UserProfile.DRIVER:
          movements = await movementService.listMovementsByDriver(
            req.user.id,
            query.status
          );
          break;
  
        default:
          res.status(403).json({ message: "Acesso negado" });
          return;
      }
      res.status(200).json(movements);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Parâmetros inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },
  async startMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementId = parseInt(req.params.id);
  
      if (!req.user || req.user.profile !== UserProfile.DRIVER) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }
  
      // Passar o userId (não driverId)
      const movement = await movementService.startMovement(
        movementId,
        req.user.id // ID do usuário logado
      );
  
      res.status(200).json(movement);  
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Movimentação não encontrada":
            res.status(404).json({ message: error.message });
            break;
          case "Status inválido para início":
          case "Motorista não autorizado":
            res.status(400).json({ message: error.message });
            break;
          default:
            res.status(500).json({ message: "Erro interno" });
        }
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },

  async endMovement(req: Request, res: Response): Promise<void> {
    try {
      const movementId = parseInt(req.params.id);
  
      if (!req.user || req.user.profile !== UserProfile.DRIVER) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }
  
      const movement = await movementService.endMovement(
        movementId,
        req.user.id
      );
  
      res.status(200).json(movement);
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case "Movimentação não encontrada":
            res.status(404).json({ message: error.message });
            break;
          case "Status inválido para finalização":
          case "Motorista não autorizado":
            res.status(400).json({ message: error.message });
            break;
          default:
            res.status(500).json({ message: "Erro interno" });
        }
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },
};
