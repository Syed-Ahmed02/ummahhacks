"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type CampaignType = "public" | "anonymous";

type CampaignTypeCardProps = {
  type: CampaignType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
};

function CampaignTypeCard({
  type,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: CampaignTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-6 text-left transition-colors",
        "hover:border-foreground/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2",
        selected
          ? "border-foreground bg-muted/30"
          : "border-border bg-background"
      )}
      aria-pressed={selected}
      data-type={type}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border flex-shrink-0",
            selected
              ? "border-foreground text-foreground"
              : "border-border text-muted-foreground"
          )}
        >
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

type CampaignTypeSelectorProps = {
  onSelect: (type: CampaignType) => void;
  selectedType?: CampaignType;
};

export function CampaignTypeSelector({
  onSelect,
  selectedType,
}: CampaignTypeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampaignTypeCard
        type="public"
        title="Public Campaign"
        description="Your name and location will be visible to donors. Full transparency helps build trust."
        icon={Eye}
        selected={selectedType === "public"}
        onSelect={() => onSelect("public")}
      />
      <CampaignTypeCard
        type="anonymous"
        title="Anonymous Campaign"
        description="Your identity will be protected. Only your city and utility type will be shown."
        icon={EyeOff}
        selected={selectedType === "anonymous"}
        onSelect={() => onSelect("anonymous")}
      />
    </div>
  );
}
