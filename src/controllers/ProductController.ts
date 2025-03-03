import { Request, Response } from "express";
import { z } from "zod";
import { createProductSchema, listProductsSchema } from "../schemas/productSchemas";
import { productService } from "../services/product.services";
import { UserProfile } from "../entities/User";
import { ProductResponse } from "../types/ProductResponse";

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
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const query = listProductsSchema.parse(req.query);
      let products: ProductResponse[];

      if (req.user?.profile === UserProfile.ADMIN) {
        products = await productService.listProducts(query.branch_id);
      } else if (req.user?.profile === UserProfile.BRANCH) {
        products = await productService.listProducts(req.user.branch.id);
      } else {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }
      res.status(200).json(products);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Parâmetros inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Erro interno" });
      }
    }
  },

};