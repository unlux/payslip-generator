"use client";

import type {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldArrayWithId,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LIMITS } from "@/lib/constants";
import { Plus, Trash2 } from "lucide-react";
import type { EmployeeFormValues } from "@/lib/validators";

interface CustomFieldsEditorProps {
  fields: FieldArrayWithId<EmployeeFormValues, "customFields", "id">[];
  append: UseFieldArrayAppend<EmployeeFormValues, "customFields">;
  remove: UseFieldArrayRemove;
  register: (
    name: `customFields.${number}.key` | `customFields.${number}.value`,
  ) => Record<string, unknown>;
  errors?: Record<
    number,
    { key?: { message?: string }; value?: { message?: string } }
  >;
}

export function CustomFieldsEditor({
  fields,
  append,
  remove,
  register,
  errors,
}: CustomFieldsEditorProps) {
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="Field name"
              {...register(`customFields.${index}.key`)}
            />
            {errors?.[index]?.key?.message && (
              <p className="text-destructive mt-1 text-xs">
                {errors[index].key!.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Input
              placeholder="Value"
              {...register(`customFields.${index}.value`)}
            />
            {errors?.[index]?.value?.message && (
              <p className="text-destructive mt-1 text-xs">
                {errors[index].value!.message}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      {fields.length < LIMITS.MAX_CUSTOM_FIELDS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ key: "", value: "" })}
        >
          <Plus className="size-4" />
          Add Field
        </Button>
      )}
    </div>
  );
}
