"use client";

import { Heart, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export type Role = "contributor" | "recipient";

type RoleCardProps = {
  role: Role;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
};

function RoleCard({
  role,
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-colors",
        "hover:border-foreground/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2",
        selected
          ? "border-foreground bg-muted/30"
          : "border-border bg-background"
      )}
      aria-pressed={selected}
      data-role={role}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border",
          selected ? "border-foreground text-foreground" : "border-border text-muted-foreground"
        )}
      >
        <Icon className="size-7" aria-hidden />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

type RoleSelectorProps = {
  onSelect: (role: Role) => void;
  selectedRole?: Role;
};

export function RoleSelector({ onSelect, selectedRole }: RoleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RoleCard
        role="contributor"
        title="I want to help"
        description="Contribute weekly to help neighbors facing utility shut-offs"
        icon={Heart}
        selected={selectedRole === "contributor"}
        onSelect={() => onSelect("contributor")}
      />
      <RoleCard
        role="recipient"
        title="I need help"
        description="Get assistance with urgent utility bills"
        icon={Lightbulb}
        selected={selectedRole === "recipient"}
        onSelect={() => onSelect("recipient")}
      />
    </div>
  );
}
