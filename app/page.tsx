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
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
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
          <h1 className="text-3xl font-extrabold">Ship Fast ⚡️</h1>

          <p className="text-lg opacity-80">
            The start of your new startup... What are you gonna build?
          </p>

          <a
            className="btn btn-primary"
            href="https://shipfa.st/docs"
            target="_blank"
          >
            Documentation & tutorials{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                clipRule="evenodd"
              />
            </svg>
          </a>

          <Link href="/blog" className="link link-hover text-sm">
            Fancy a blog?
          </Link>
        </section>
      </main>
    </>
  );
}
