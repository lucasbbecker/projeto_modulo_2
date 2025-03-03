import { z } from "zod";

export const createMovementSchema = z.object({
  product_id: z.number().int().positive("ID do produto inválido"),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  destination_branch_id: z.number().int().positive("ID da filial de destino inválido"),
});