import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(1, { error: "Password is required." }),
});

export const signupSchema = z.object({
  displayName: z.string().trim().min(2, {
    error: "Name must be at least 2 characters long.",
  }),
  email: z.email({ error: "Enter a valid email address." }),
  password: z.string().min(8, {
    error: "Password must be at least 8 characters long.",
  }),
});
