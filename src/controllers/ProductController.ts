import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { createProductSchema, listProductsSchema } from "../schemas/productSchemas";
import { productService } from "../services/product.services";
import { UserProfile } from "../entities/User";
import { ProductResponse } from "../types/ProductResponse";

export const productsController = {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createProductSchema.parse(req.body);
      
      if (!req.user || req.user.profile !== UserProfile.BRANCH || !req.user.branch) {
        res.status(403).json({ message: "Acesso negado" });
        return;
      }

      const product = await productService.createProduct(body, req.user.branch.id);
      res.status(201).json(product);

    } catch (error) {
      next(error);
    }
  },
  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  },

};