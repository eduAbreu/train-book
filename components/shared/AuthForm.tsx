"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthMessages, type UserRole, type Locale } from "@/types/auth";

interface AuthFormProps {
  role: UserRole;
  signUpAction: (formData: FormData) => Promise<any>;
  signInAction: (formData: FormData) => Promise<any>;
  locale?: Locale;
}

function SubmitButton({
  isLogin,
  locale = "en",
}: {
  isLogin: boolean;
  locale?: Locale;
}) {
  const { pending } = useFormStatus();
  const messages = AuthMessages[locale];

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending
        ? messages.LOADING
        : isLogin
          ? messages.SIGN_IN
          : messages.CREATE_ACCOUNT}
    </Button>
  );
}

export default function AuthForm({
  role,
  signUpAction,
  signInAction,
  locale = "en",
}: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const messages = AuthMessages[locale];
  const roleLabel = role === "owner" ? "Gym Owner" : "Student";

  console.log("----role", role);
  console.log("----isLogin", isLogin);
  const handleSubmit = (formData: FormData) => {
    console.log("----formData handleSubmit", formData, isLogin);
    console.debug("----formData handleSubmit", formData, isLogin);
    setError(null);
    console.log("----formData handleSubmit", formData, isLogin);
    startTransition(async () => {
      try {
        console.log("----formData isLogin", formData, isLogin);
        if (isLogin) {
          await signInAction(formData);
        } else {
          await signUpAction(formData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {roleLabel}</CardTitle>
        <CardDescription>
          {isLogin
            ? `Sign in to your ${role} account`
            : `Create your ${role} account`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <Tabs value={isLogin ? "login" : "register"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
              {messages.SIGN_IN}
            </TabsTrigger>
            <TabsTrigger value="register" onClick={() => setIsLogin(false)}>
              {messages.CREATE_ACCOUNT}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{messages.EMAIL_LABEL}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={messages.EMAIL_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{messages.PASSWORD_LABEL}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={messages.PASSWORD_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>
              <SubmitButton isLogin={true} locale={locale} />
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{messages.NAME_LABEL}</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder={messages.NAME_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{messages.EMAIL_LABEL}</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder={messages.EMAIL_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">
                  {messages.PASSWORD_LABEL}
                </Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder={messages.PASSWORD_PLACEHOLDER}
                  required
                  aria-describedby={error ? "error-message" : undefined}
                />
                <p className="text-xs text-gray-500">
                  {messages.PASSWORD_MIN_LENGTH}
                </p>
              </div>
              <SubmitButton isLogin={false} locale={locale} />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
