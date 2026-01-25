"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/constants/canada";
import type { CampaignType } from "./CampaignTypeSelector";
import type { UtilityType } from "@/components/request/UtilityTypeSelector";

type CampaignFormProps = {
  title: string;
  description: string;
  goalAmount: string;
  utilityType: UtilityType | null;
  utilityProvider: string;
  amountDue: string;
  shutoffDate: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onGoalAmountChange: (value: string) => void;
  onUtilityTypeChange: (value: UtilityType) => void;
  onUtilityProviderChange: (value: string) => void;
  onAmountDueChange: (value: string) => void;
  onShutoffDateChange: (value: string) => void;
};

export function CampaignForm({
  title,
  description,
  goalAmount,
  utilityType,
  utilityProvider,
  amountDue,
  shutoffDate,
  onTitleChange,
  onDescriptionChange,
  onGoalAmountChange,
  onUtilityTypeChange,
  onUtilityProviderChange,
  onAmountDueChange,
  onShutoffDateChange,
}: CampaignFormProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Create a compelling campaign to help raise funds for your utility bill
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Help Keep Our Lights On"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              A clear, compelling title helps people understand your need
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell your story... What led to this situation? How will this help?"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Share your story to help donors connect with your cause
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-amount">Goal Amount (CAD) *</Label>
            <Input
              id="goal-amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={goalAmount}
              onChange={(e) => onGoalAmountChange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The amount you need to raise. This should match or exceed your bill amount.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utility Bill Information</CardTitle>
          <CardDescription>
            Details about the utility bill you need help with
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="utility-type">Utility Type *</Label>
            <Select
              value={utilityType || undefined}
              onValueChange={(value) => onUtilityTypeChange(value as UtilityType)}
              required
            >
              <SelectTrigger id="utility-type">
                <SelectValue placeholder="Select utility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="heating">Heating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="utility-provider">Utility Provider *</Label>
            <Input
              id="utility-provider"
              placeholder="e.g., Hydro One, Toronto Hydro"
              value={utilityProvider}
              onChange={(e) => onUtilityProviderChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount-due">Amount Due (CAD) *</Label>
            <Input
              id="amount-due"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amountDue}
              onChange={(e) => onAmountDueChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shutoff-date">Shutoff Date *</Label>
            <Input
              id="shutoff-date"
              type="date"
              value={shutoffDate}
              onChange={(e) => onShutoffDateChange(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              The date when service will be disconnected if not paid
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
