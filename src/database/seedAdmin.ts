require('dotenv').config()
import { AppDataSource } from "../data-source";
import { User, UserProfile } from "../entities/User";
import { hash } from "bcryptjs";

async function createAdmin() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const adminData = {
    name: "Admin",
    profile: UserProfile.ADMIN,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    document: "13564981631",
    status: true,
  };

  const existingAdmin = await userRepository.findOne({ 
    where: { email: adminData.email } 
  });

  if (existingAdmin) {
    console.log("Admin já existe!");
    return;
  }

  if (!adminData.password) {
    throw new Error("Admin não definido nas variáveis de ambiente");
  }
  const hashedPassword = await hash(adminData.password, 8);

  const admin = userRepository.create({
    ...adminData,
    password_hash: hashedPassword,
  });

  await userRepository.save(admin);
  console.log("Admin criado com sucesso!");
}

createAdmin().catch(console.error);