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
};