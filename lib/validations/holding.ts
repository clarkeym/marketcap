import * as z from "zod";

export const addHoldingSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, { error: "Symbol is required." })
    .max(10, { error: "Symbol looks too long." })
    .transform((s) => s.toUpperCase()),
  shares: z.coerce.number().positive({ error: "Shares must be greater than 0." }),
  costBasis: z.coerce.number().nonnegative({ error: "Cost basis can't be negative." }),
  purchaseDate: z.string().min(1, { error: "Purchase date is required." }),
  notes: z.string().trim().max(500).optional(),
});

export type AddHoldingInput = z.infer<typeof addHoldingSchema>;
