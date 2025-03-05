import { z } from "zod";
import { MovementStatus } from "../entities/Movement";

export const createMovementSchema = z.object({
  product_id: z.number().int().positive("ID do produto inválido"),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  destination_branch_id: z.number().int().positive("ID da filial de destino inválido"),
});

export const listMovementsSchema = z.object({
  status: z.nativeEnum(MovementStatus).optional(),
  branch_id: z.number().int().positive().optional(),
});

export const updateMovementStatusSchema = z.object({
  status: z.nativeEnum(MovementStatus).optional(),
});