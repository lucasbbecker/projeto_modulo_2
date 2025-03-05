import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";

export const userService = {
  listUsers: async (profile?: UserProfile) => {
    const userRepository = AppDataSource.getRepository(User);
    const query = userRepository.createQueryBuilder("user");

    if (profile) {
      query.where("user.profile = :profile", { profile });
    }

    return query
      .select(["user.id", "user.name", "user.status", "user.profile"])
      .getMany();
  },

  getUserById: async (userId: number, loggedUser: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["branch", "driver"],
    });

    if (!user) return null;

    if (loggedUser.profile !== UserProfile.ADMIN && loggedUser.id !== userId) {
      throw new Error("Acesso negado");
    }

    return {
      id: user.id,
      name: user.name,
      status: user.status,
      full_address: user.branch?.full_address || user.driver?.full_address,
      profile: user.profile,
    };
  },
  updateUser: async (userId: number, updateData: any, loggedUser: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["driver", "branch"],
    });

    if (!user) throw new Error("Usuário não encontrado");

    if (loggedUser.profile !== UserProfile.ADMIN && loggedUser.id !== userId) {
      throw new Error("Acesso negado");
    }

    if (updateData.name) user.name = updateData.name;

    if (user.profile === UserProfile.DRIVER && user.driver) {
      if (updateData.full_address)
        user.driver.full_address = updateData.full_address;
      if (updateData.document) user.driver.document = updateData.document;
      await AppDataSource.getRepository(Driver).save(user.driver);
    } else if (user.profile === UserProfile.BRANCH && user.branch) {
      if (updateData.full_address)
        user.branch.full_address = updateData.full_address;
      if (updateData.document) user.branch.document = updateData.document;
      await AppDataSource.getRepository(Branch).save(user.branch);
    }

    await userRepository.save(user);

    const updatedUser = await userRepository.findOne({
      where: { id: userId },
      relations: ["driver", "branch"],
    });

    if (!updatedUser) throw new Error("Erro ao atualizar o usuário");

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      profile: updatedUser.profile,
      status: updatedUser.status,
      ...(updatedUser.driver && {
        full_address: updatedUser.driver.full_address,
        document: updatedUser.driver.document,
      }),
      ...(updatedUser.branch && {
        full_address: updatedUser.branch.full_address,
        document: updatedUser.branch.document,
      }),
    };
  },
  updateUserStatus: async (
    userId: number,
    newStatus: boolean,
    loggedUser: any
  ) => {
    const userRepository = AppDataSource.getRepository(User);

    const userToUpdate = await userRepository.findOne({
      where: { id: userId },
    });
    if (!userToUpdate) throw new Error("Usuário não encontrado");

    if (loggedUser.profile !== UserProfile.ADMIN) {
      throw new Error("Acesso negado");
    }

    if (userToUpdate.id === loggedUser.id) {
      throw new Error("Acesso negado");
    }

    userToUpdate.status = newStatus;
    await userRepository.save(userToUpdate);

    return {
      id: userToUpdate.id,
      name: userToUpdate.name,
      profile: userToUpdate.profile,
      status: userToUpdate.status,
    };
  },
};
