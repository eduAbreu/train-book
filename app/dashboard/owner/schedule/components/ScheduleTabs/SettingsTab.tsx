import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SettingsTabProps {
  gymSettingsComponent?: React.ReactNode;
  onGenerateClasses: (data: { startDate: string; endDate: string }) => void;
}

export function SettingsTab({
  gymSettingsComponent,
  onGenerateClasses,
}: SettingsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-muted-foreground">
            Configure as definições do seu ginásio
          </p>
        </div>
      </div>

      {/* Studio Settings Component */}
      {gymSettingsComponent && (
        <div className="space-y-6">{gymSettingsComponent}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geração Automática</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Gerar Aulas Semanalmente</h4>
                <p className="text-sm text-muted-foreground">
                  Cria aulas automaticamente baseadas nos horários
                </p>
              </div>
              <Button
                onClick={() => {
                  const startDate = new Date();
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + 7);
                  onGenerateClasses({
                    startDate: startDate.toISOString().split("T")[0],
                    endDate: endDate.toISOString().split("T")[0],
                  });
                }}
                variant="outline"
              >
                Gerar Próxima Semana
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Lembretes de Aula</h4>
                <p className="text-sm text-muted-foreground">
                  Envia notificações antes das aulas
                </p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
