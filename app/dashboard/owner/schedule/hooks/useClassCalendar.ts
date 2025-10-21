import { useState, useMemo } from "react";
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

// Helper function to validate dates
export const isValidDate = (date: any): date is Date => {
  if (!date) return false;
  if (!(date instanceof Date)) return false;
  if (isNaN(date.getTime())) return false;
  return true;
};

export function useClassCalendar(classes: any[]) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  // Get classes for the selected date
  const selectedDateClasses = useMemo(() => {
    return classes
      .filter((classItem) => {
        if (!selectedDate || !classItem.date) return false;

        const classDate = new Date(classItem.date);
        if (!isValidDate(classDate)) return false;
        return isSameDay(classDate, selectedDate);
      })
      .sort((a, b) => {
        // Sort by date first, then by time
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime();
        }
        return a.start_time.localeCompare(b.start_time);
      });
  }, [classes, selectedDate]);

  // Get classes for the current month
  const currentMonth = selectedDate || new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Create a map of classes by date for the calendar
  const classesByDate = useMemo(() => {
    return classes.reduce(
      (acc, classItem) => {
        if (!classItem.date) return acc;

        const date = new Date(classItem.date);
        if (!isValidDate(date)) return acc;

        const dateKey = format(date, "yyyy-MM-dd");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(classItem);
        return acc;
      },
      {} as Record<string, any[]>
    );
  }, [classes]);

  return {
    selectedDate,
    setSelectedDate,
    selectedDateClasses,
    classesByDate,
    monthDays,
  };
}
