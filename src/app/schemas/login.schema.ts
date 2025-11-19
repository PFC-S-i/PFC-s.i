// src/schemas/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "Usuário ou senha inválidos."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
