"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Users, TrendingUp } from "lucide-react";

interface ScheduleOverviewProps {
  classes: any[];
  scheduleSlots: any[];
}

export function ScheduleOverview({
  classes,
  scheduleSlots,
}: ScheduleOverviewProps) {
  // Calculate statistics
  const activeSlots =
    scheduleSlots?.filter((slot) => slot.is_active).length || 0;

  // Classes for today
  const today = new Date();
  const todayClasses =
    classes?.filter((classItem) => {
      const classDate = new Date(classItem.date);
      return classDate.toDateString() === today.toDateString();
    }) || [];

  // Classes for this week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weekClasses =
    classes?.filter((classItem) => {
      const classDate = new Date(classItem.date);
      return classDate >= weekStart && classDate <= weekEnd;
    }) || [];

  // Upcoming classes (next 7 days)
  const upcomingClasses =
    classes?.filter((classItem) => {
      const classDate = new Date(classItem.date);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return classDate > today && classDate <= nextWeek;
    }) || [];

  const stats = [
    {
      title: "Aulas Hoje",
      value: todayClasses.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Esta Semana",
      value: weekClasses.length,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Próximas 7 Dias",
      value: upcomingClasses.length,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Horários Ativos",
      value: activeSlots,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.borderColor} ${stat.bgColor}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} ${stat.borderColor}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
