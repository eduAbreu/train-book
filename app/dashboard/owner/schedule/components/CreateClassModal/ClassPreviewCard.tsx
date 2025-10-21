import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock } from "lucide-react";
import type { ClassPreview } from "@/app/dashboard/owner/schedule/hooks/useCreateClassForm";

interface ClassPreviewCardProps {
  preview: ClassPreview[];
}

export function ClassPreviewCard({ preview }: ClassPreviewCardProps) {
  if (preview.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Preview ({preview.length} aulas)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {preview.slice(0, 10).map((classItem, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{classItem.dayOfWeek}</Badge>
                <span className="text-sm">{classItem.date}</span>
                <Clock className="h-3 w-3" />
                <span className="text-sm">{classItem.time}</span>
              </div>
              <span className="text-sm font-medium">{classItem.classType}</span>
            </div>
          ))}
          {preview.length > 10 && (
            <p className="text-sm text-gray-500 text-center">
              ... e mais {preview.length - 10} aulas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
