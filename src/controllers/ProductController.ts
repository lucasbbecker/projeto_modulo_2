import { Request, Response } from "express";
import { z } from "zod";
import { createProductSchema } from "../schemas/productSchemas";
import { productService } from "../services/product.services";
import { UserProfile } from "../entities/User";

export const productsController = {
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const body = createProductSchema.parse(req.body);
      
      // Verifica se é BRANCH e tem branchId no token
      if (!req.user || req.user.profile !== UserProfile.BRANCH || !req.user.branch) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }

      // Passa o branchId do usuário logado
      const product = await productService.createProduct(body, req.user.branch.id);
      res.status(201).json(product);

    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      } else if (error instanceof Error && error.message === "Filial não encontrada") {
        res.status(404).json({ message: "Filial não encontrada" });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },
};