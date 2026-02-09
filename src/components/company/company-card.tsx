/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import type { Company } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currencies";

interface CompanyCardProps {
  company: Company;
}

export function CompanyCard({ company }: CompanyCardProps) {
  const currencySymbol = getCurrencySymbol(company.currency);

  return (
    <Link href={`/company/${company.id}`}>
      <Card className="cursor-pointer transition-colors hover:bg-accent/50">
        <CardHeader className="flex-row items-center gap-3">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-10 w-10 rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
              <BuildingIcon className="size-5 text-muted-foreground" />
            </div>
          )}
          <div className="grid gap-1">
            <CardTitle className="text-base">{company.name}</CardTitle>
            <Badge variant="secondary" className="w-fit text-xs">
              {company.currency} {currencySymbol}
            </Badge>
          </div>
        </CardHeader>
        {(company.address || company.city) && (
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              {[company.address, company.city, company.pincode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
