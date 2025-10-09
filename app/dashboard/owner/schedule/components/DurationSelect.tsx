import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DurationSelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 75, label: "1h 15min" },
  { value: 90, label: "1h 30min" },
  { value: 105, label: "1h 45min" },
  { value: 120, label: "2 horas" },
  { value: 135, label: "2h 15min" },
  { value: 150, label: "2h 30min" },
  { value: 165, label: "2h 45min" },
  { value: 180, label: "3 horas" },
];

export function DurationSelect({
  value,
  onChange,
  disabled,
}: DurationSelectProps) {
  return (
    <Select
      value={value.toString()}
      onValueChange={(valueStr) => onChange(Number.parseInt(valueStr))}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecionar duração" />
      </SelectTrigger>
      <SelectContent>
        {DURATION_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
