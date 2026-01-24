"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreditCard, FileBarChart, User } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button render={<Link href="/subscription" />} nativeButton={false} variant="outline" size="sm" className="gap-2">
        <CreditCard className="size-4" aria-hidden />
        Manage subscription
      </Button>
      <Button render={<Link href="/reports" />} nativeButton={false} variant="outline" size="sm" className="gap-2">
        <FileBarChart className="size-4" aria-hidden />
        View reports
      </Button>
      <Button render={<Link href="/dashboard/profile" />} nativeButton={false} variant="outline" size="sm" className="gap-2">
        <User className="size-4" aria-hidden />
        Update profile
      </Button>
    </div>
  );
}
