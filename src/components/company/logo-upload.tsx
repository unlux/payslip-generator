/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { LIMITS } from "@/lib/constants";
import { ImageIcon, XIcon } from "lucide-react";

interface LogoUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = LIMITS.LOGO_MAX_SIZE;
      canvas.height = LIMITS.LOGO_MAX_SIZE;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, LIMITS.LOGO_MAX_SIZE, LIMITS.LOGO_MAX_SIZE);
      const base64 = canvas.toDataURL("image/jpeg", LIMITS.LOGO_QUALITY);
      onChange(base64);
    };
    img.src = URL.createObjectURL(file);

    // reset so same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Logo preview"
            className="h-16 w-16 rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            className="absolute -top-2 -right-2"
            onClick={() => onChange("")}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed">
          <ImageIcon className="size-6 text-muted-foreground" />
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        {value ? "Change" : "Upload"}
      </Button>
    </div>
  );
}
