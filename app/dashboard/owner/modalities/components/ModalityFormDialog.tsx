"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  type ClassType,
  type CreateClassTypeData,
  type UpdateClassTypeData,
} from "@/features/class-types/actions";

interface ModalityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modality?: ClassType | null;
  onSave: (modality: CreateClassTypeData | UpdateClassTypeData) => void;
  isLoading?: boolean;
}

export function ModalityFormDialog({
  open,
  onOpenChange,
  modality,
  onSave,
  isLoading = false,
}: ModalityFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (modality) {
      setFormData({
        name: modality.name,
        emoji: modality.emoji || "",
        is_active: modality.is_active,
      });
    } else {
      setFormData({
        name: "",
        emoji: "",
        is_active: true,
      });
    }
    setErrors({});
  }, [modality, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const modalityData = {
      name: formData.name.trim(),
      emoji: formData.emoji.trim() || undefined,
      is_active: formData.is_active,
    };

    onSave(modalityData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modality ? "Edit Modality" : "New Modality"}
          </DialogTitle>
          <DialogDescription>
            Configure the details of your studio modality
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Kettlebell Strength"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji (optional)</Label>
            <Input
              id="emoji"
              value={formData.emoji}
              onChange={(e) =>
                setFormData({ ...formData, emoji: e.target.value })
              }
              placeholder="🧘"
              maxLength={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Modality</Label>
              <p className="text-sm text-muted-foreground">
                Inactive modalities won&apos;t appear in new schedules
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked: boolean) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : modality ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
