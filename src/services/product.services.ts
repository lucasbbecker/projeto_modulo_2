import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { Branch } from "../entities/Branch";

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
};