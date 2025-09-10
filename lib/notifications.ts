"use client";

import { NOTIFICATION_MESSAGES } from "@/lib/constants";
import type { NotificationType } from "@/types/database";

// Notification payload interfaces
interface BookingNotificationData {
  classId: string;
  className: string;
  date: string;
  startTime: string;
  gymId: string;
  url?: string;
}

interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  actions?: NotificationConfigAction[];
  requireInteraction?: boolean;
}

interface NotificationConfigAction {
  action: string;
  title: string;
  icon?: string;
}
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.ready;
      return true;
    } catch (error) {
      console.error("Failed to initialize notification service:", error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  async showNotification(config: NotificationConfig): Promise<void> {
    if (!this.registration || Notification.permission !== "granted") {
      return;
    }

    const options: NotificationOptions = {
      body: config.body,
      icon: config.icon || "/icons/icon-192x192.png",
      badge: config.badge || "/icons/icon-72x72.png",
      tag: config.tag || "train-book-notification",
      data: config.data,
      // @ts-expect-error: 'actions' is not yet in the NotificationOptions type in TypeScript, but is supported in modern browsers
      actions: config.actions,
      requireInteraction: config.requireInteraction || false,
      vibrate: [200, 100, 200],
    };

    await this.registration.showNotification(config.title, options);
  }

  // Booking-specific notification methods
  async notifyBookingConfirmed(data: BookingNotificationData): Promise<void> {
    await this.showNotification({
      title: NOTIFICATION_MESSAGES.booked.title,
      body: `${data.className} on ${data.date} at ${data.startTime}`,
      tag: `booking-confirmed-${data.classId}`,
      data: {
        type: "booking_confirmed",
        classId: data.classId,
        url: data.url || `/gym/bookings`,
      },
      actions: [
        {
          action: "view",
          title: "View Details",
          icon: "/icons/action-view.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/icons/action-cancel.png",
        },
      ],
    });
  }

  async notifyWaitlistAdded(
    data: BookingNotificationData & { position: number }
  ): Promise<void> {
    await this.showNotification({
      title: NOTIFICATION_MESSAGES.waitlist.title,
      body: `You're #${data.position} on the waitlist for ${data.className}`,
      tag: `waitlist-${data.classId}`,
      data: {
        type: "waitlist_added",
        classId: data.classId,
        position: data.position,
        url: data.url || `/gym/classes/${data.classId}`,
      },
    });
  }

  async notifyWaitlistPromoted(data: BookingNotificationData): Promise<void> {
    await this.showNotification({
      title: NOTIFICATION_MESSAGES.promoted.title,
      body: NOTIFICATION_MESSAGES.promoted.message,
      tag: `promoted-${data.classId}`,
      data: {
        type: "waitlist_promoted",
        classId: data.classId,
        url: data.url || `/gym/bookings`,
      },
      actions: [
        {
          action: "view",
          title: "View Booking",
          icon: "/icons/action-view.png",
        },
      ],
      requireInteraction: true,
    });
  }

  async notifyBookingCanceled(
    data: BookingNotificationData & { canceledBy: "student" | "owner" }
  ): Promise<void> {
    const message =
      data.canceledBy === "student"
        ? NOTIFICATION_MESSAGES.canceled.student
        : NOTIFICATION_MESSAGES.canceled.owner;

    await this.showNotification({
      title: NOTIFICATION_MESSAGES.canceled.title,
      body: `${data.className} on ${data.date} - ${message}`,
      tag: `canceled-${data.classId}`,
      data: {
        type: "booking_canceled",
        classId: data.classId,
        canceledBy: data.canceledBy,
        url: data.url || `/gym/classes`,
      },
    });
  }

  async notifyClassReminder(
    data: BookingNotificationData & {
      reminderType: "day_before" | "hour_before";
    }
  ): Promise<void> {
    const message =
      data.reminderType === "day_before"
        ? NOTIFICATION_MESSAGES.reminder.day_before
        : NOTIFICATION_MESSAGES.reminder.hour_before;

    await this.showNotification({
      title: NOTIFICATION_MESSAGES.reminder.title,
      body: `${data.className} on ${data.date} at ${data.startTime} - ${message}`,
      tag: `reminder-${data.classId}-${data.reminderType}`,
      data: {
        type: "class_reminder",
        classId: data.classId,
        reminderType: data.reminderType,
        url: data.url || `/gym/bookings`,
      },
      actions: [
        {
          action: "view",
          title: "View Details",
          icon: "/icons/action-view.png",
        },
      ],
    });
  }

  async notifyPlanLimitReached(data: {
    planName: string;
    currentUsage: number;
    weeklyLimit: number;
  }): Promise<void> {
    await this.showNotification({
      title: NOTIFICATION_MESSAGES.plan_limit.title,
      body: `You've used ${data.currentUsage}/${data.weeklyLimit} classes in your ${data.planName} plan`,
      tag: "plan-limit-reached",
      data: {
        type: "plan_limit_reached",
        planName: data.planName,
        usage: data.currentUsage,
        limit: data.weeklyLimit,
        url: `/gym/plan`,
      },
    });
  }

  // Push subscription management
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || !("PushManager" in window)) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
        ),
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
      }
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });
    } catch (error) {
      console.error("Failed to send subscription to server:", error);
    }
  }

  private async removeSubscriptionFromServer(
    subscription: PushSubscription
  ): Promise<void> {
    try {
      await fetch("/api/notifications/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });
    } catch (error) {
      console.error("Failed to remove subscription from server:", error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Convenience function to get the singleton instance
export const notificationService = NotificationService.getInstance();

// React hook for notifications
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("Notification" in window && "serviceWorker" in navigator);
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setPermission(Notification.permission);
    return granted;
  };

  const subscribeToPush = async (): Promise<PushSubscription | null> => {
    await notificationService.initialize();
    return await notificationService.subscribeToPush();
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    return await notificationService.unsubscribeFromPush();
  };

  return {
    isSupported,
    permission,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    service: notificationService,
  };
}

// Import useState and useEffect
import { useState, useEffect } from "react";
