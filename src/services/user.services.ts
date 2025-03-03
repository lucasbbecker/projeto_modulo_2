import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";

export const userService = {
  listUsers: async (profile?: UserProfile) => {
    const userRepository = AppDataSource.getRepository(User);
    const query = userRepository.createQueryBuilder("user");

    if (profile) {
      query.where("user.profile = :profile", { profile });
    }

    return query.select(["user.id", "user.name", "user.status", "user.profile"]).getMany();
  },

  getUserById: async (userId: number, loggedUser: any) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["branch", "driver"],
    });

    if (!user) return null;

    if (
      loggedUser.profile !== UserProfile.ADMIN &&
      loggedUser.id !== userId
    ) {
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
};