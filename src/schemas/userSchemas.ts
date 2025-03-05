import { z } from "zod";
import { UserProfile } from "../entities/User";

export const createUserSchema = z.object({
  name: z.string().min(1),
  profile: z.nativeEnum(UserProfile),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().refine((doc) => {
    const cleanedDoc = doc.replace(/\D/g, "");
    return cleanedDoc.length === 11 || cleanedDoc.length === 14;
  }, "Documento inválido (CPF ou CNPJ)"),
  full_address: z.string().optional(),
});


export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  full_address: z.string().optional(),
  document: z.string().optional().refine((doc) => {
    if (!doc) return true;
    const cleanedDoc = doc.replace(/\D/g, "");
    return cleanedDoc.length === 11 || cleanedDoc.length === 14;
  }, "Documento inválido (CPF ou CNPJ)")
});

export const updateStatusSchema = z.object({
    status: z.boolean(),
});