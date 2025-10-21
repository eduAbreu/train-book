import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WeeklyTemplateSlot } from "@/types/schedule";
import type { ClassType } from "@/features/class-types/actions";
import { SlotFormFields } from "./SlotFormFields";
import { MultiDaySelector } from "./MultiDaySelector";

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  classTypeId: string;
  capacity: number;
  instructor?: string;
}

interface FormData {
  start: string;
  durationMinutes: number;
  classTypeId: string;
  capacity: number;
  instructor: string;
}

interface SlotFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingSlot: WeeklyTemplateSlot | null;
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  selectedDays: string[];
  onDayToggle: (day: string, checked: boolean) => void;
  classTypes: ClassType[];
  weeklyTemplate: { [key: string]: TimeSlot[] };
  activeDay: string;
  onSave: () => void;
  onApplyToDays: () => void;
  isLoading?: boolean;
  validateForm: () => string | null;
  getComputedEnd: () => string;
}

export function SlotFormDialog({
  isOpen,
  onClose,
  editingSlot,
  formData,
  onFormDataChange,
  selectedDays,
  onDayToggle,
  classTypes,
  weeklyTemplate,
  activeDay,
  onSave,
  onApplyToDays,
  isLoading,
  validateForm,
  getComputedEnd,
}: SlotFormDialogProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const error = validateForm();
      setValidationError(error);
    }
  }, [isOpen, formData, selectedDays, validateForm]);

  const handleSave = () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }
    onSave();
  };

  const handleApplyToDays = () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }
    onApplyToDays();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-4/5 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSlot ? "Edit Time Slot" : "Add Time Slot"}
          </DialogTitle>
          <DialogDescription>
            {editingSlot
              ? "Update the time slot details"
              : "Create a new time slot for your weekly schedule"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <SlotFormFields
            formData={formData}
            onFormDataChange={onFormDataChange}
            classTypes={classTypes}
            getComputedEnd={getComputedEnd}
            isLoading={isLoading}
          />

          {!editingSlot && (
            <MultiDaySelector
              selectedDays={selectedDays}
              onDayToggle={onDayToggle}
              isLoading={isLoading}
            />
          )}

          {validationError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {validationError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {editingSlot ? (
            <Button
              onClick={handleSave}
              disabled={isLoading || !!validationError}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          ) : selectedDays.length > 0 ? (
            <Button
              onClick={handleApplyToDays}
              disabled={isLoading || !!validationError}
            >
              {isLoading ? "Applying..." : "Apply to Selected Days"}
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isLoading || !!validationError}
            >
              {isLoading ? "Creating..." : "Create Slot"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
