import { z } from "zod";
import { UserProfile } from "../entities/User";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  full_address: z.string().optional(),
  document: z.string().optional().refine((doc) => {
    if (!doc) return true; // Campo opcional
    const cleanedDoc = doc.replace(/\D/g, "");
    return cleanedDoc.length === 11 || cleanedDoc.length === 14;
  }, "Documento inválido (CPF ou CNPJ)")
});