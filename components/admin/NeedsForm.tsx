"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Charity } from "@/lib/types";

export type NeedsEntry = {
  charityId: string;
  urgencyScore: number;
  fundingGapAmount: number;
  category: string;
  notes: string;
};

type NeedsFormProps = {
  charities: Charity[];
  onSubmit?: (data: NeedsEntry) => void;
  onCancel?: () => void;
};

export function NeedsForm({
  charities,
  onSubmit,
  onCancel,
}: NeedsFormProps) {
  const [charityId, setCharityId] = useState("");
  const [urgencyScore, setUrgencyScore] = useState(50);
  const [fundingGapAmount, setFundingGapAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundingGapAmount);
    if (!charityId || isNaN(amount) || amount < 0) return;
    onSubmit?.({
      charityId,
      urgencyScore,
      fundingGapAmount: amount,
      category,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border">
        <CardHeader>
          <h3 className="font-medium text-foreground">Needs entry</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>
              <Label>Charity</Label>
            </FieldLabel>
            <Select
              value={charityId}
              onValueChange={(value) => setCharityId(value ?? "")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select charity" />
              </SelectTrigger>
              <SelectContent>
                {charities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="needs-urgency">Urgency score (0–100)</Label>
            </FieldLabel>
            <Input
              id="needs-urgency"
              type="number"
              min={0}
              max={100}
              value={urgencyScore}
              onChange={(e) => setUrgencyScore(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="needs-gap">Funding gap amount ($)</Label>
            </FieldLabel>
            <Input
              id="needs-gap"
              type="number"
              min={0}
              step={0.01}
              value={fundingGapAmount}
              onChange={(e) => setFundingGapAmount(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="needs-category">Category</Label>
            </FieldLabel>
            <Input
              id="needs-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food, Shelter"
            />
          </Field>
          <Field>
            <FieldLabel>
              <Label htmlFor="needs-notes">Notes</Label>
            </FieldLabel>
            <Textarea
              id="needs-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </Field>
          <FieldGroup className="flex flex-row gap-2 pt-2">
            <Button type="submit">Save</Button>
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
