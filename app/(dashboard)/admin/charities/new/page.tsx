"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CharityForm } from "@/components/admin/CharityForm";
import { ArrowLeft } from "lucide-react";

export default function AdminNewCharityPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link
          href="/admin/charities"
          className="text-primary mb-2 inline-flex items-center gap-2 text-sm font-medium hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to charities
        </Link>
        <h1 className="font-semibold text-foreground text-2xl">Create charity</h1>
        <p className="text-muted-foreground mt-1">
          Add a new charity to the platform.
        </p>
      </div>
      <CharityForm
        onSubmit={() => router.push("/admin/charities")}
        onCancel={() => router.push("/admin/charities")}
      />
    </div>
  );
}
