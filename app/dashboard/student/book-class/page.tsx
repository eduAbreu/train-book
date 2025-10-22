"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, Clock, Users, User } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import Header from "@/app/dashboard/components/Header";
import { useAuth } from "@/provider/AuthProvider";
import {
  createBooking,
  getClasses,
  getUserBookings,
  type CreateBookingData,
  type Class,
} from "@/features/classes/actions";
import type { Booking } from "@/types/gym";
import { ClassMessages } from "@/types/gym";

const messages = ClassMessages.en;

export default function BookClassPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Date selection state - default to today
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Handle redirects with useEffect to avoid hydration issues
  React.useEffect(() => {
    if (!user || !profile) {
      router.push("/signin/student");
      return;
    }

    if (profile.role !== "student") {
      router.push("/dashboard");
      return;
    }

    if (!profile.gym_id) {
      router.push("/onboarding/choose-gym");
      return;
    }
  }, [user, profile, router]);

  const gymId = profile.gym_id;

  // Format selected date for API calls
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Fetch classes for the selected date
  const {
    data: classesResponse,
    isLoading: classesLoading,
    error: classesError,
  } = useQuery({
    queryKey: ["classes", gymId, selectedDateStr],
    queryFn: () => getClasses(gymId, selectedDateStr, selectedDateStr),
    enabled: !!gymId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const classes = classesResponse?.success ? classesResponse.data || [] : [];

  // Fetch user bookings
  const {
    data: bookingsResponse,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["bookings", user.id, gymId],
    queryFn: () => getUserBookings(user.id, gymId),
    enabled: !!user.id && !!gymId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const bookings = bookingsResponse?.success ? bookingsResponse.data || [] : [];

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const result = await createBooking(data);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      // Force refetch to get updated data immediately
      queryClient.refetchQueries({ queryKey: ["classes"] });
      queryClient.refetchQueries({ queryKey: ["bookings"] });

      toast.success(
        data?.status === "confirmed"
          ? messages.CLASS_BOOKED_SUCCESS
          : "You've been added to the waitlist. We'll notify you if a spot opens up."
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to book class");
    },
  });

  const canBookClass = (
    classInstance: Class
  ): { canBook: boolean; reason?: string } => {
    if (!user) return { canBook: false, reason: "Not authenticated" };

    // Check if booking is in progress
    if (createBookingMutation.isPending) {
      return { canBook: false, reason: messages.BOOKING_IN_PROGRESS };
    }

    // Check for existing booking
    const existingBooking = bookings?.find(
      (b) => b.class_id === classInstance.id && b.user_id === user.id
    );
    if (existingBooking) {
      return { canBook: false, reason: messages.ALREADY_BOOKED };
    }

    // For now, we'll allow booking if no existing booking
    // Plan limits and other validations can be added later
    return { canBook: true };
  };

  const handleBookClass = async (classInstance: Class) => {
    if (!user) return;

    const { canBook, reason } = canBookClass(classInstance);

    if (!canBook) {
      toast.error(reason || messages.CANNOT_BOOK);
      return;
    }

    console.log("Booking class:", classInstance);

    try {
      const bookingData: CreateBookingData = {
        class_id: classInstance.id,
        participant: "student",
      };

      await createBookingMutation.mutateAsync(bookingData);
    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  const getBookingCounts = (classInstance: Class) => {
    // This would typically come from a separate query or be included in the class data
    // For now, we'll return mock data
    if (!classInstance) return { confirmed: 0, waitlist: 0 };
    return { confirmed: 0, waitlist: 0 };
  };

  const getUserBookingStatus = (classInstance: Class) => {
    if (!bookings || !user) return null;

    const userBooking = bookings.find(
      (b) => b.class_id === classInstance.id && b.user_id === user.id
    );

    if (!userBooking) return null;

    return {
      status: userBooking.status,
      isWaitlisted: userBooking.status === "waitlist",
    };
  };

  const getClassTypeName = (classInstance: Class) => {
    if (!classInstance) return "Unknown Class";
    return classInstance.class_type?.name || "Unknown Class";
  };

  // Get classes for the selected date
  const classesForSelectedDate =
    classes?.filter(
      (classInstance) => classInstance.date === selectedDateStr
    ) || [];

  // Show loading while checking authentication
  if (!user || !profile || profile.role !== "student" || !profile.gym_id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Book a Class</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
          <div className="flex justify-center">
            <Skeleton className="h-[400px] w-full max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  if (classesLoading || bookingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Book a Class</h1>
            <p className="text-muted-foreground">
              Select a date to view available classes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>

            {/* Classes Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Available Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-[100px] w-full" />
                  <Skeleton className="h-[100px] w-full" />
                  <Skeleton className="h-[100px] w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (classesError || bookingsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Book a Class</h1>
            <p className="text-muted-foreground">
              Select a date to view available classes
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive">
                  {classesError?.message ||
                    bookingsError?.message ||
                    "Failed to load data"}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book a Class</h1>
          <p className="text-muted-foreground">
            Select a date to view available classes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Choose a date to see available classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
              />
            </CardContent>
          </Card>

          {/* Classes for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Classes for {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {classesForSelectedDate.length} class
                {classesForSelectedDate.length !== 1 ? "es" : ""} available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classesForSelectedDate.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {messages.NO_CLASSES_SCHEDULED}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classesForSelectedDate.map((classInstance, index) => {
                    if (!classInstance) return null;

                    const { confirmed: confirmedCount } =
                      getBookingCounts(classInstance);
                    const isFull =
                      confirmedCount >= (classInstance.capacity || 0);
                    const userBookingStatus =
                      getUserBookingStatus(classInstance);
                    const { canBook } = canBookClass(classInstance);

                    return (
                      <Card
                        key={classInstance.id || `class-${index}`}
                        className="border-l-4 border-l-primary"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {getClassTypeName(classInstance)}
                            </CardTitle>
                            {userBookingStatus && (
                              <Badge
                                variant={
                                  userBookingStatus.status === "confirmed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {userBookingStatus.isWaitlisted
                                  ? messages.WAITLISTED
                                  : messages.CONFIRMED}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {(() => {
                                  try {
                                    // Extract hours and minutes from time string
                                    const getTimeFromString = (
                                      timeStr: string
                                    ) => {
                                      if (!timeStr) return "00:00";

                                      // Handle both "08:00:00" and "2025-01-09T08:00:00.000Z" formats
                                      if (timeStr.includes("T")) {
                                        // Full timestamp - extract time part
                                        const timePart = timeStr
                                          .split("T")[1]
                                          ?.split(".")[0];
                                        return (
                                          timePart?.substring(0, 5) || "00:00"
                                        ); // Get HH:MM
                                      } else {
                                        // Time format - just get HH:MM
                                        return (
                                          timeStr.substring(0, 5) || "00:00"
                                        );
                                      }
                                    };

                                    const startTime = getTimeFromString(
                                      classInstance.start_time
                                    );
                                    const endTime = getTimeFromString(
                                      classInstance.end_time
                                    );

                                    return `${startTime} - ${endTime}`;
                                  } catch (error) {
                                    console.error(
                                      "Error formatting time:",
                                      error
                                    );
                                    return "00:00 - 00:00";
                                  }
                                })()}
                              </span>
                            </span>
                            {classInstance.instructor && (
                              <span className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{classInstance.instructor}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {confirmedCount}/{classInstance.capacity} booked
                              </span>
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {userBookingStatus ? (
                            <Button
                              className="w-full"
                              disabled
                              variant="secondary"
                            >
                              {userBookingStatus.isWaitlisted
                                ? messages.WAITLISTED
                                : messages.BOOKED}
                            </Button>
                          ) : !canBook ? (
                            <Button
                              className="w-full"
                              disabled
                              variant="destructive"
                            >
                              {messages.CANNOT_BOOK}
                            </Button>
                          ) : (
                            <Button
                              className="w-full"
                              onClick={() => handleBookClass(classInstance)}
                              disabled={createBookingMutation.isPending}
                              variant={isFull ? "secondary" : "default"}
                            >
                              {createBookingMutation.isPending
                                ? messages.BOOKING
                                : isFull
                                  ? messages.JOIN_WAITLIST
                                  : messages.BOOK_CLASS}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
