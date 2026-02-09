"use client";

import { useFieldArray, useWatch, type Control } from "react-hook-form";
import type { PayComponent } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LIMITS } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";

interface PayComponentsEditorProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  name: "earnings" | "deductions";
  label: string;
}

export function PayComponentsEditor({
  control,
  name,
  label,
}: PayComponentsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const watchedValues: PayComponent[] = useWatch({ control, name }) ?? [];

  const total = watchedValues.reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ name: "", amount: 0 })}
          disabled={fields.length >= LIMITS.MAX_PAY_COMPONENTS}
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} added yet.
        </p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              placeholder="Component name"
              {...control.register(`${name}.${index}.name`)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Amount"
              {...control.register(`${name}.${index}.amount`, {
                valueAsNumber: true,
              })}
              className="w-32"
              min={0}
              step="any"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-between border-t pt-2 text-sm font-medium">
          <span>Total {label}</span>
          <span>{total.toLocaleString("en-IN")}</span>
        </div>
      )}
    </div>
  );
}
