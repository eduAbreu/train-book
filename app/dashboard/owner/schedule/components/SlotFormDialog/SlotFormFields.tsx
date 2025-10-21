import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DurationSelect } from "../DurationSelect";
import type { ClassType } from "@/features/class-types/actions";

interface FormData {
  start: string;
  durationMinutes: number;
  classTypeId: string;
  capacity: number;
  instructor: string;
}

interface SlotFormFieldsProps {
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  classTypes: ClassType[];
  getComputedEnd: () => string;
  isLoading?: boolean;
}

export function SlotFormFields({
  formData,
  onFormDataChange,
  classTypes,
  getComputedEnd,
  isLoading,
}: SlotFormFieldsProps) {
  return (
    <div className="grid gap-4">
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
            onValueChange={(value) => onFormDataChange({ classTypeId: value })}
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
    </div>
  );
}
