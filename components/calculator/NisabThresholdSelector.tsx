"use client";

import { Button } from "@/components/ui/shadcn/button";
import { Badge } from "@/components/ui/shadcn/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { NisabStandardToggle } from "@/components/ui/NisabStandardToggle";

export type NisabType = "silver" | "gold";

interface NisabThresholdSelectorProps {
  nisabType: NisabType;
  onNisabTypeChange: (type: NisabType) => void;
  silverNisab: number;
  goldNisab: number;
  formatCurrency: (amount: number) => string;
}

export function NisabThresholdSelector({
  nisabType,
  onNisabTypeChange,
  silverNisab,
  goldNisab,
  formatCurrency,
}: NisabThresholdSelectorProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-stone-800">
          Nisab Threshold
        </CardTitle>
        <p className="text-sm text-stone-600">
          Choose which threshold to use for calculation
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Button
            variant={nisabType === "silver" ? "default" : "outline"}
            onClick={() => onNisabTypeChange("silver")}
            className="w-full h-auto py-3 px-4"
          >
            <div className="flex items-center justify-between w-full gap-3">
              <span className="font-medium">Silver Nisab</span>
              <Badge
                variant="secondary"
                className="text-xs whitespace-nowrap cursor-pointer"
              >
                {formatCurrency(silverNisab)}
              </Badge>
            </div>
          </Button>
          <Button
            variant={nisabType === "gold" ? "default" : "outline"}
            onClick={() => onNisabTypeChange("gold")}
            className="w-full h-auto py-3 px-4"
          >
            <div className="flex items-center justify-between w-full gap-3">
              <span className="font-medium">Gold Nisab</span>
              <Badge
                variant="secondary"
                className="text-xs whitespace-nowrap cursor-pointer"
              >
                {formatCurrency(goldNisab)}
              </Badge>
            </div>
          </Button>
        </div>
        <p className="text-xs text-stone-500 mt-3">
          Silver threshold is typically lower, making more people eligible for
          Zakat
        </p>
        <div className="mt-4 pt-4 border-t border-stone-100">
          <p className="text-sm font-medium text-stone-700 mb-2">
            Weight standard
          </p>
          <NisabStandardToggle />
        </div>
      </CardContent>
    </Card>
  );
}
