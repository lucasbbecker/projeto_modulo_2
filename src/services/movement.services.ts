import { AppDataSource } from "../data-source";
import { Movement, MovementStatus } from "../entities/Movement";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import { Driver } from "../entities/Driver";
import { AppError } from "../utils/AppError";

export const movementService = {
  async createMovement(data: {
    product_id: number;
    quantity: number;
    source_branch_id: number;
    destination_branch_id: number;
  }) {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const destinationBranch = await transactionalEntityManager.findOne(
        Branch,
        {
          where: { id: data.destination_branch_id },
        }
      );
      if (!destinationBranch) {
        throw new AppError("Filial de destino não encontrada", 404);
      }

      if (data.source_branch_id === data.destination_branch_id) {
        throw new AppError("Filial de destino não pode ser a mesma de origem", 400);
      }

      const sourceProduct = await transactionalEntityManager.findOne(Product, {
        where: { id: data.product_id, branch: { id: data.source_branch_id } },
      });

      if (!sourceProduct) {
        throw new AppError("Produto não encontrado na filial de origem", 404);
      }

      if (sourceProduct.amount < data.quantity) {
        throw new AppError("Estoque insuficiente", 400, {
          disponível: sourceProduct.amount,
          solicitado: data.quantity
        });
      }
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
  listMovementsByBranch: async (branchId: number, status?: MovementStatus) => {
    const movementRepository = AppDataSource.getRepository(Movement);
    const query = movementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.product", "product")
      .leftJoinAndSelect("movement.sourceBranch", "sourceBranch")
      .leftJoinAndSelect("movement.destinationBranch", "destinationBranch")
      .where(
        "(sourceBranch.id = :branchId OR destinationBranch.id = :branchId)",
        {
          branchId,
        }
      );

    if (status) {
      query.andWhere("movement.status = :status", { status });
    }

    return query.getMany();
  },

  listMovementsByDriver: async (driverId: number, status?: MovementStatus) => {
    const driver = await AppDataSource.getRepository(Driver).findOne({
      where: { user: { id: driverId } },
      relations: ["user"]
    });
  
    if (!driver) {
      throw new AppError("Motorista não encontrado", 404);
    }
  
    const movementRepository = AppDataSource.getRepository(Movement);
    const query = movementRepository
      .createQueryBuilder("movement")
      .leftJoinAndSelect("movement.product", "product")
      .leftJoinAndSelect("movement.driver", "driver")
      .leftJoinAndSelect("movement.destinationBranch", "destinationBranch")
      .where("movement.driver.id = :driverId", { driverId: driver.id });
  
    if (status) {
      query.andWhere("movement.status = :status", { status });
    } else {
      query.andWhere("movement.status IN (:...statuses)", {
        statuses: [MovementStatus.IN_PROGRESS, MovementStatus.FINISHED]
      });
    }
  

    return query.getMany();
  },
  startMovement: async (movementId: number, driverId: number) => {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const driver = await transactionalEntityManager.findOne(Driver, {
        where: { user: { id: driverId } },
      });
  
      if (!driver) {
        throw new AppError("Motorista não encontrado", 404);
      }
  
      const movement = await transactionalEntityManager.findOne(Movement, {
        where: { id: movementId },
      });
  
      if (!movement) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      if (movement.status !== MovementStatus.PENDING) {
        throw new AppError("Status inválido para início", 400);
      }
  
      movement.status = MovementStatus.IN_PROGRESS;
      movement.driver = driver;
  
      await transactionalEntityManager.save(movement);
      return movement;
    });
  },
  endMovement: async (movementId: number, userId: number) => {
    return AppDataSource.transaction(async (transactionalEntityManager) => {
      const driver = await transactionalEntityManager.findOne(Driver, {
        where: { user: { id: userId } },
        relations: ["user"] 
      });
  
      if (!driver) {
        throw new Error("Motorista não encontrado");
      }
  
      const movement = await transactionalEntityManager.findOne(Movement, {
        where: { id: movementId },
        relations: [
          "driver", 
          "product", 
          "destinationBranch",
          "sourceBranch"
        ]
      });
  
      if (!movement) {
        throw new AppError("Movimentação não encontrada", 404);
      }

      if (movement.status !== MovementStatus.IN_PROGRESS) {
        throw new AppError("Status inválido para finalização", 400);
      }

      if (movement.driver?.id !== driver.id) {
        throw new AppError("Motorista não autorizado", 403);
      }
  
      movement.status = MovementStatus.FINISHED;
      await transactionalEntityManager.save(movement);
  
      const destinationProduct = await transactionalEntityManager.findOne(Product, {
        where: {
          name: movement.product.name,
          branch: { id: movement.destinationBranch.id }
        }
      });
  
      if (destinationProduct) {
        destinationProduct.amount += movement.quantity;
        await transactionalEntityManager.save(destinationProduct);
      } else {
        const newProduct = transactionalEntityManager.create(Product, {
          name: movement.product.name,
          amount: movement.quantity,
          description: movement.product.description,
          url_cover: movement.product.url_cover,
          branch: movement.destinationBranch
        });
        await transactionalEntityManager.save(newProduct);
      }
  
      return movement;
    });
  }  
};
