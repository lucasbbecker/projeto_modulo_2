import { AppDataSource } from "../data-source";
import { Movement, MovementStatus } from "../entities/Movement";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";

export const movementService = {
  async createMovement(data: {
    product_id: number;
    quantity: number;
    source_branch_id: number;
    destination_branch_id: number;
  }) {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const destinationBranch = await transactionalEntityManager.findOne(Branch, {
        where: { id: data.destination_branch_id },
      });
      if (!destinationBranch) throw new Error("Filial de destino não encontrada");

      if (data.source_branch_id === data.destination_branch_id) {
        throw new Error("Filial de destino inválida");
      }

      const sourceProduct = await transactionalEntityManager.findOne(Product, {
        where: {
          id: data.product_id,
          branch: { id: data.source_branch_id },
        },
      });
      if (!sourceProduct) throw new Error("Produto não encontrado na filial de origem");
      if (sourceProduct.amount < data.quantity) throw new Error("Estoque insuficiente");

      sourceProduct.amount -= data.quantity;
      await transactionalEntityManager.save(sourceProduct);

      const movement = transactionalEntityManager.create(Movement, {
        product: { id: data.product_id },
        sourceBranch: { id: data.source_branch_id },
        destinationBranch: { id: data.destination_branch_id },
        quantity: data.quantity,
        status: MovementStatus.PENDING,
      });

      await transactionalEntityManager.save(movement);
      return movement;
    });
  },
};