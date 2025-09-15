"use client";

import Link from "next/link";
import ButtonSignin from "@/components/ButtonSignin";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // Register service worker with proper error handling
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        })
        .then((registration) => {
          console.log("Service Worker registered successfully:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, reload the page
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.error(
            "Service Worker registration failed:",
            registrationError
          );
          // Silently fail - PWA features will be disabled but app still works
        });
    }
  }, []);

  return (
    <>
      <header className="p-4 flex justify-end max-w-7xl mx-auto">
        <ButtonSignin text="Login" />
      </header>

      <InstallPrompt />
      <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-24">
          <h1 className="text-3xl font-extrabold">TrainBook 💪</h1>

          <p className="text-lg opacity-80">
            Complete gym management system for owners and students. Manage
            classes, bookings, plans, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signin/owner" className="btn btn-primary">
              I&apos;m a Gym Owner
            </Link>
            <Link href="/signin/student" className="btn btn-outline">
              I&apos;m a Student
            </Link>
          </div>

          <Link href="/blog" className="link link-hover text-sm">
            Read our blog
          </Link>
        </section>
      </main>
    </>
  );
}
