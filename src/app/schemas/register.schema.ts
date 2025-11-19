import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .nonempty("Informe seu nome completo.")
      .min(3, "Informe seu nome completo."),
    email: z
      .string()
      .nonempty("Informe o e-mail.")
      .email("Informe um e-mail válido."),
    password: z
      .string()
      .nonempty("Informe a senha.")
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(128, "A senha deve ter no máximo 128 caracteres."),
    confirm: z.string().nonempty("Confirme a senha."),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem.",
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
