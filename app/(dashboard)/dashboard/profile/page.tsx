"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-semibold text-foreground text-2xl">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your account details. Auth integration is covered by the Auth plan.
        </p>
      </div>
      <Card className="border-border">
        <CardHeader>
          <h2 className="font-medium text-foreground">Details</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>
              <Label htmlFor="profile-name">Name</Label>
            </FieldLabel>
            <Input id="profile-name" defaultValue="Guest User" />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="profile-email">Email</Label>
            </FieldLabel>
            <Input id="profile-email" type="email" defaultValue="guest@example.com" />
          </Field>
          <Button disabled>Save (connect Auth)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
