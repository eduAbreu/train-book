import { Calendar } from "lucide-react";

interface ScheduleHeaderProps {
  title?: string;
  description?: string;
}

export function ScheduleHeader({
  title = "Weekly Schedule",
  description = "Manage your weekly class templates",
}: ScheduleHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
