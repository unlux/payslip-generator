"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InlineInputProps extends React.ComponentProps<"input"> {
  label?: string;
}

export function InlineInput({ className, label, ...props }: InlineInputProps) {
  return (
    <Input
      aria-label={label}
      className={cn(
        "h-auto rounded-none border-0 border-b border-transparent bg-transparent px-0 py-0 shadow-none",
        "hover:border-muted-foreground/30 focus-visible:border-ring focus-visible:ring-0",
        "placeholder:text-muted-foreground/50",
        className,
      )}
      {...props}
    />
  );
}
