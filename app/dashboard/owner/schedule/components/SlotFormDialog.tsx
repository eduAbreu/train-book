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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateDurationFromSlot } from "@/lib/schedule";
import { DurationSelect } from "./DurationSelect";
import type { WeeklyTemplateSlot } from "@/types/schedule";
import type { ClassType } from "@/features/class-types/actions";

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
  conflictMode: "skip" | "replace";
  onConflictModeChange: (mode: "skip" | "replace") => void;
  classTypes: ClassType[];
  weeklyTemplate: { [key: string]: TimeSlot[] };
  activeDay: string;
  onSave: () => void;
  onApplyToDays: () => void;
  isLoading?: boolean;
  validateForm: () => string | null;
  getComputedEnd: () => string;
}

const DAYS = [
  { key: "Mon", label: "Monday" },
  { key: "Tue", label: "Tuesday" },
  { key: "Wed", label: "Wednesday" },
  { key: "Thu", label: "Thursday" },
  { key: "Fri", label: "Friday" },
  { key: "Sat", label: "Saturday" },
  { key: "Sun", label: "Sunday" },
];

export function SlotFormDialog({
  isOpen,
  onClose,
  editingSlot,
  formData,
  onFormDataChange,
  selectedDays,
  onDayToggle,
  conflictMode,
  onConflictModeChange,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.start}
                onChange={(e) => onFormDataChange({ start: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <DurationSelect
                value={formData.durationMinutes}
                onChange={(value) =>
                  onFormDataChange({
                    durationMinutes: value,
                  })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>End Time</Label>
            <div className="text-sm text-muted-foreground">
              {getComputedEnd() || "Enter start time and duration"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class-type">Class Type</Label>
              <Select
                value={formData.classTypeId}
                onValueChange={(value) =>
                  onFormDataChange({ classTypeId: value })
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  onFormDataChange({
                    capacity: Number.parseInt(e.target.value) || 1,
                  })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor (optional)</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => onFormDataChange({ instructor: e.target.value })}
              placeholder="Enter instructor name"
              disabled={isLoading}
            />
          </div>

          {!editingSlot && (
            <>
              <div className="space-y-2">
                <Label>Apply to Days</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS.map((day) => (
                    <div key={day.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.key}`}
                        checked={selectedDays.includes(day.key)}
                        onCheckedChange={(checked) =>
                          onDayToggle(day.key, checked as boolean)
                        }
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`day-${day.key}`}
                        className="text-sm font-normal"
                      >
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {selectedDays.length > 0 && (
                <div className="space-y-2">
                  <Label>Conflict Resolution</Label>
                  <RadioGroup
                    value={conflictMode}
                    onValueChange={(value: "skip" | "replace") =>
                      onConflictModeChange(value)
                    }
                    disabled={isLoading}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id="skip" />
                      <Label htmlFor="skip" className="text-sm font-normal">
                        Skip days with conflicts
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="text-sm font-normal">
                        Replace existing slots
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </>
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
