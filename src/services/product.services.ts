import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";
import { ProductResponse } from "../types/ProductResponse";

export const productService = {
  createProduct: async (productData: any, branchId: number) => {
    const productRepository = AppDataSource.getRepository(Product);
    const branchRepository = AppDataSource.getRepository(Branch);

    const branch = await branchRepository.findOne({ 
      where: { id: branchId },
      relations: ["user"]
    });

    if (!branch) throw new Error("Filial não encontrada");

    const product = productRepository.create({
      name: productData.name,
      amount: productData.amount,
      description: productData.description,
      url_cover: productData.url_cover,
      branch: branch,
    });

    await productRepository.save(product);
    
    return {
      ...product,
      branch: {
        id: branch.id,
        name: branch.user?.name,
      },
    };
  },
  listProducts: async (branchId?: number): Promise<ProductResponse[]> => {
    const productRepository = AppDataSource.getRepository(Product);
    const query = productRepository
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.branch", "branch")
      .leftJoinAndSelect("branch.user", "user")
      .select([
        "product.id",
        "product.name",
        "product.amount",
        "product.description",
        "product.url_cover",
        "branch.id",
        "user.name",
      ]);

    if (branchId) {
      query.where("branch.id = :branchId", { branchId });
    }

    const products = await query.getMany();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      amount: product.amount,
      description: product.description,
      url_cover: product.url_cover || undefined,
      branch: {
        id: product.branch.id,
        name: product.branch.user.name,
      },
    }));
  },
};