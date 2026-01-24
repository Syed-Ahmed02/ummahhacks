"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationInput, type LocationValue } from "@/components/shared/LocationInput";
import type { Charity } from "@/lib/types";

type CharityFormProps = {
  charity?: Charity | null;
  onSubmit?: (data: Partial<Charity>) => void;
  onCancel?: () => void;
};

export function CharityForm({
  charity,
  onSubmit,
  onCancel,
}: CharityFormProps) {
  const [name, setName] = useState(charity?.name ?? "");
  const [description, setDescription] = useState(charity?.description ?? "");
  const [category, setCategory] = useState(charity?.category ?? "");
  const [website, setWebsite] = useState(charity?.website ?? "");
  const [contactEmail, setContactEmail] = useState(charity?.contactEmail ?? "");
  const [location, setLocation] = useState<LocationValue>({
    city: charity?.city ?? "",
    state: charity?.state ?? "",
    zip: charity?.zip ?? "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      name,
      description,
      category,
      website,
      contactEmail,
      city: location.city,
      state: location.state,
      zip: location.zip,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardHeader>
          <h3 className="font-medium text-foreground">
            {charity ? "Edit charity" : "New charity"}
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>
              <Label htmlFor="charity-name">Name</Label>
            </FieldLabel>
            <Input
              id="charity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="charity-desc">Description</Label>
            </FieldLabel>
            <Input
              id="charity-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="charity-category">Category</Label>
            </FieldLabel>
            <Input
              id="charity-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food Security, Housing"
            />
          </Field>
          <LocationInput value={location} onChange={setLocation} />
          <Field>
            <FieldLabel>
              <Label htmlFor="charity-website">Website</Label>
            </FieldLabel>
            <Input
              id="charity-website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="charity-email">Contact email</Label>
            </FieldLabel>
            <Input
              id="charity-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </Field>
          <FieldGroup className="flex flex-row gap-2 pt-2">
            <Button type="submit">{charity ? "Save" : "Create"}</Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  );
}
