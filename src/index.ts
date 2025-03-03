import 'dotenv/config';
import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import userRouter from "./routes/user.routes";
import productRouter from "./routes/product.routes";
import movementRouter from './routes/movement.routes';
import { handleError } from "./middlewares/handleError";
import authRouter from "./routes/auth.routes";
import logger from "./config/winston";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/login", authRouter);
app.use("/products", productRouter);
app.use("/movements", movementRouter);

app.get("/env", (req, res) => {
  res.json({
    port: process.env.PORT,
    node_env: process.env.NODE_ENV,
  });
});

app.use(handleError);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Rota não encontrada" });
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Erro não tratado: ${error.message}`, { error });
  res.status(500).json({ message: "Ocorreu um erro interno no servidor" });
});

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(
        `Servidor rodando na porta ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    logger.error("Erro na conexão com o banco de dados:", error);
    process.exit(1);
  });