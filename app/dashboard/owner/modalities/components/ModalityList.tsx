"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Edit } from "lucide-react";
import { type ClassType } from "@/features/class-types/actions";

interface ModalityListProps {
  modalities: ClassType[];
  onEdit: (modality: ClassType) => void;
  onToggleActive: (modalityId: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function ModalityList({
  modalities,
  onEdit,
  onToggleActive,
  isLoading = false,
}: ModalityListProps) {
  if (modalities.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No modalities found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {modalities.map((modality) => {
          return (
            <Card key={modality.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {modality.emoji && (
                      <span className="text-lg">{modality.emoji}</span>
                    )}
                    <div>
                      <h3 className="font-medium">{modality.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created{" "}
                        {new Date(modality.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Badge variant={modality.is_active ? "default" : "secondary"}>
                    {modality.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(modality)}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Switch
                    checked={modality.is_active}
                    onCheckedChange={(checked: boolean) =>
                      onToggleActive(modality.id, checked)
                    }
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
