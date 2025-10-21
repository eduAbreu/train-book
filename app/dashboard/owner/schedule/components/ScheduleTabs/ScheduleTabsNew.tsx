"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BarChart3, Settings } from "lucide-react";
import { ClassesTab } from "./ClassesTab";
import { SlotsTab } from "./SlotsTab";
import { ReportsTab } from "./ReportsTab";
import { SettingsTab } from "./SettingsTab";

interface ScheduleTabsNewProps {
  classes: any[];
  scheduleSlots: any[];
  weeklyTemplate: { [key: string]: any[] };
  getClassTypeName: (classTypeId: string) => string;
  onAddClass: () => void;
  onAddSlot: () => void;
  onEditClass: (classItem: any) => void;
  onEditSlot: (slot: any) => void;
  onDeleteClass: (classId: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onViewBookings: (classItem: any) => void;
  onGenerateFromSlot: (slot: any) => void;
  onGenerateClasses: (data: { startDate: string; endDate: string }) => void;
  gymSettingsComponent?: React.ReactNode;
}

export function ScheduleTabsNew({
  classes,
  scheduleSlots,
  weeklyTemplate,
  getClassTypeName,
  onAddClass,
  onAddSlot,
  onEditClass,
  onEditSlot,
  onDeleteClass,
  onDeleteSlot,
  onViewBookings,
  onGenerateFromSlot,
  onGenerateClasses,
  gymSettingsComponent,
}: ScheduleTabsNewProps) {
  const [activeTab, setActiveTab] = useState("classes");

  const getSlotCount = (day: string) => {
    return weeklyTemplate[day]?.length || 0;
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="classes" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aulas
            <Badge variant="secondary" className="ml-1">
              {classes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="slots" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horários
            <Badge variant="secondary" className="ml-1">
              {scheduleSlots.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">
          <ClassesTab
            classes={classes}
            getClassTypeName={getClassTypeName}
            onAddClass={onAddClass}
            onEditClass={onEditClass}
            onDeleteClass={onDeleteClass}
            onViewBookings={onViewBookings}
          />
        </TabsContent>

        <TabsContent value="slots" className="space-y-6">
          <SlotsTab
            scheduleSlots={scheduleSlots}
            getClassTypeName={getClassTypeName}
            onAddSlot={onAddSlot}
            onEditSlot={onEditSlot}
            onDeleteSlot={onDeleteSlot}
            onGenerateFromSlot={onGenerateFromSlot}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsTab
            classes={classes}
            scheduleSlots={scheduleSlots}
            weeklyTemplate={weeklyTemplate}
            getSlotCount={getSlotCount}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SettingsTab
            gymSettingsComponent={gymSettingsComponent}
            onGenerateClasses={onGenerateClasses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
