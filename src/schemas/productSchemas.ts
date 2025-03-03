import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().int().positive("Quantidade deve ser positiva"),
  description: z.string().min(1,"Descrição é obrigatória"),
  url_cover: z.string().optional(),
});