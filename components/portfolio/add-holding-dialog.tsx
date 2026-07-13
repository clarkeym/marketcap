"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHolding } from "@/app/actions/holdings";
import { addHoldingSchema } from "@/lib/validations/holding";

export function AddHoldingDialog({
  trigger,
  defaultSymbol,
}: {
  trigger: React.ReactElement;
  defaultSymbol?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  function handleSubmit(formData: FormData) {
    const raw = {
      symbol: formData.get("symbol"),
      shares: formData.get("shares"),
      costBasis: formData.get("costBasis"),
      purchaseDate: formData.get("purchaseDate"),
      notes: formData.get("notes") || undefined,
    };

    const validated = addHoldingSchema.safeParse(raw);
    if (!validated.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validated.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    startTransition(async () => {
      try {
        await addHolding(validated.data);
        toast.success(`Added ${validated.data.symbol} to your portfolio`);
        queryClient.invalidateQueries({ queryKey: ["quotes"] });
        setOpen(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to add holding");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Holding</DialogTitle>
          <DialogDescription>Track a stock you own in your portfolio.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input id="symbol" name="symbol" defaultValue={defaultSymbol} placeholder="AAPL" required />
            {errors.symbol && <p className="text-sm text-destructive">{errors.symbol}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shares">Shares</Label>
              <Input id="shares" name="shares" type="number" step="any" min="0" placeholder="10" required />
              {errors.shares && <p className="text-sm text-destructive">{errors.shares}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="costBasis">Cost / share</Label>
              <Input id="costBasis" name="costBasis" type="number" step="any" min="0" placeholder="150.00" required />
              {errors.costBasis && <p className="text-sm text-destructive">{errors.costBasis}</p>}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="purchaseDate">Purchase date</Label>
            <Input id="purchaseDate" name="purchaseDate" type="date" required />
            {errors.purchaseDate && <p className="text-sm text-destructive">{errors.purchaseDate}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input id="notes" name="notes" placeholder="Long-term hold" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Holding"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
