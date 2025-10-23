import { z } from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Título deve ter pelo menos 4 caracteres.")
    .max(120, "Título deve ter no máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .min(20, "Descrição muito curta (mínimo 20 caracteres).")
    .max(5000, "Descrição muito longa (máximo 5000 caracteres)."),
});

export type PostForm = z.infer<typeof postSchema>;
