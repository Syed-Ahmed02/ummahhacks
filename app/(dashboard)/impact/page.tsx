import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldCheck, Receipt, Users } from "lucide-react";

const sections = [
  {
    title: "How requests are handled",
    description:
      "You upload a bill, our system verifies it, and if approved we pay the provider directly. No cash changes hands.",
    icon: Receipt,
  },
  {
    title: "What contributors fund",
    description:
      "Weekly contributions go into a local pool used only for utility bills in your area. Every dollar is tracked.",
    icon: Users,
  },
  {
    title: "Privacy and verification",
    description:
      "Your personal details stay private. Verification checks prevent duplicate or fake requests.",
    icon: ShieldCheck,
  },
];

export default function ImpactExplainerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">
          How the pool works
        </h1>
        <p className="text-muted-foreground mt-1">
          A clear, simple view of how assistance is verified and paid.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {sections.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="border-border">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                <Icon className="size-5 text-muted-foreground" aria-hidden />
              </div>
              <h2 className="text-sm font-medium text-foreground">{title}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">What happens next</p>
            <p className="text-sm text-muted-foreground mt-1">
              You can track your request status in “My Requests.” If anything is
              missing, we’ll notify you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/my-requests"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              View my requests
            </Link>
            <Link
              href="/submit-bill"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              Submit a bill
            </Link>
            <Link
              href="/reports"
              className="text-sm font-medium text-foreground underline underline-offset-4"
            >
              See community impact
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
