"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Zap, Droplets, Flame, ThermometerSun } from "lucide-react";

export type UtilityType = "electric" | "water" | "gas" | "heating";

type UtilityTypeSelectorProps = {
  selected: UtilityType | null;
  onSelect: (type: UtilityType) => void;
};

const utilityOptions: {
  type: UtilityType;
  label: string;
  description: string;
  icon: typeof Zap;
}[] = [
  {
    type: "electric",
    label: "Electric",
    description: "Electricity bill from your hydro provider",
    icon: Zap,
  },
  {
    type: "water",
    label: "Water",
    description: "Municipal water and sewage bill",
    icon: Droplets,
  },
  {
    type: "gas",
    label: "Gas",
    description: "Natural gas or propane bill",
    icon: Flame,
  },
  {
    type: "heating",
    label: "Heating",
    description: "Heating fuel (oil, etc.) or district heating",
    icon: ThermometerSun,
  },
];

export function UtilityTypeSelector({
  selected,
  onSelect,
}: UtilityTypeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {utilityOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.type;

        return (
          <Card
            key={option.type}
            className={cn(
              "cursor-pointer transition-colors hover:border-foreground/40",
              isSelected && "border-foreground bg-muted/30"
            )}
            onClick={() => onSelect(option.type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(option.type);
              }
            }}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={cn(
                  "flex items-center justify-center size-12 rounded-full border",
                  isSelected
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                <Icon className="size-6" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
