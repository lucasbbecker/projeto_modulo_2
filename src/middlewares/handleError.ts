import { NextFunction, Request, Response } from "express";
import logger from "../config/winston";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

export const handleError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Erro interno do servidor";
  let details: any;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) { 
    statusCode = 400;
    message = "Dados inválidos";
    details = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
  }

  else if (error.statusCode && typeof error.statusCode === "number") {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  }

  else if (error instanceof Error) {
    message = error.message;
  }

  if (statusCode === 500) {
    logger.error(`[${req.method}] ${req.path} >> ${message}`, {
      error: error.stack,
      body: req.body,
    });
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details }),
  });
};