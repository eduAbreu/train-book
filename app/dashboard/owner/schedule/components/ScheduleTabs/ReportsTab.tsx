import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart3, Clock } from "lucide-react";
import { ScheduleOverview } from "../ScheduleOverview";

interface ReportsTabProps {
  classes: any[];
  scheduleSlots: any[];
  weeklyTemplate: { [key: string]: any[] };
  getSlotCount: (day: string) => number;
}

export function ReportsTab({
  classes,
  scheduleSlots,
  weeklyTemplate,
  getSlotCount,
}: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">
            Analise o desempenho e ocupação das suas aulas
          </p>
        </div>
      </div>

      <ScheduleOverview classes={classes} scheduleSlots={scheduleSlots} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ocupação Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Segunda</span>
                <span className="font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span>Terça</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="flex justify-between">
                <span>Quarta</span>
                <span className="font-medium">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Aulas Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Yoga</span>
                <span className="font-medium">45 aulas</span>
              </div>
              <div className="flex justify-between">
                <span>CrossFit</span>
                <span className="font-medium">32 aulas</span>
              </div>
              <div className="flex justify-between">
                <span>Pilates</span>
                <span className="font-medium">28 aulas</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horários Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>09:00</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="flex justify-between">
                <span>18:00</span>
                <span className="font-medium">88%</span>
              </div>
              <div className="flex justify-between">
                <span>19:00</span>
                <span className="font-medium">82%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
