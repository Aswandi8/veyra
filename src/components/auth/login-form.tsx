"use client";

import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { TypographyMuted } from "@/components/ui/typography";

import { getAccountStatusError, getLoginErrorMessage } from "@/lib/auth/errors";

import { loginSchema, type LoginFormValues } from "@/lib/auth/schema";

interface LoginFormProps {
  callbackUrl?: string;
}

interface LoginResponse {
  success?: boolean;

  code?: string;
  error?: string;
  message?: string;

  user?: {
    id: string;
    name: string | null;
    email: string;

    emailVerified?: boolean;

    banned?: boolean | null;

    status?: string;
  };
}

export function LoginForm({ callbackUrl = "/dashboard" }: LoginFormProps) {
  const router = useRouter();

  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify(values),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const body = await response.text();

        console.error(
          "[VEYRA LOGIN] Non-JSON response:",
          response.status,
          body.slice(0, 200),
        );

        toast.error(
          "Server autentikasi mengembalikan response yang tidak valid.",
        );

        return;
      }

      const data = (await response.json()) as LoginResponse;

      if (!response.ok || data.success === false) {
        toast.error(
          getLoginErrorMessage(data.code, data.error || data.message),
        );

        return;
      }

      if (!data.user) {
        toast.error("Login berhasil, tetapi session pengguna tidak ditemukan.");

        return;
      }

      const statusError = getAccountStatusError(data.user.status);

      if (statusError) {
        toast.error(statusError);

        return;
      }

      if (data.user.banned) {
        toast.error("Akun kamu telah diblokir.");

        return;
      }

      if (data.user.emailVerified === false) {
        toast.error("Email kamu belum diverifikasi.");

        return;
      }

      toast.success("Login berhasil.");

      router.replace(callbackUrl);

      router.refresh();
    } catch (error) {
      console.error("[VEYRA LOGIN]", error);

      toast.error("Tidak dapat terhubung ke server.");
    }
  }

  return (
    <div className="w-full">
      {/* Header */}

      <div className="mb-7 [@media(max-height:680px)]:mb-5">
        <div className="mb-3 flex items-center gap-2 text-primary [@media(max-height:680px)]:mb-2">
          <ShieldCheck className="size-4" />

          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em]">
            Secure access
          </span>
        </div>

        <h1 className="font-display text-[clamp(2.5rem,4vw,3.5rem)] font-semibold leading-none tracking-tight text-foreground [@media(max-height:680px)]:text-4xl">
          Welcome back
        </h1>

        <TypographyMuted className="mt-3 max-w-sm text-sm leading-6 sm:text-base [@media(max-height:680px)]:mt-2 [@media(max-height:680px)]:text-xs [@media(max-height:680px)]:leading-5">
          Sign in to continue to your Veyra workspace.
        </TypographyMuted>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5 [@media(max-height:680px)]:space-y-3"
      >
        {/* Email */}

        <div className="space-y-2 [@media(max-height:680px)]:space-y-1.5">
          <Label htmlFor="email">Email address</Label>

          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="email"
              type="email"
              autoFocus
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              className="h-12 bg-background pl-10 pr-4 [@media(max-height:680px)]:h-10"
              {...register("email")}
            />
          </div>

          {errors.email?.message && (
            <TypographyMuted className="text-xs text-destructive">
              {errors.email.message}
            </TypographyMuted>
          )}
        </div>

        {/* Password */}

        <div className="space-y-2 [@media(max-height:680px)]:space-y-1.5">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              className="h-12 bg-background pl-10 pr-11 [@media(max-height:680px)]:h-10"
              {...register("password")}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isSubmitting}
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>

          {errors.password?.message && (
            <TypographyMuted className="text-xs text-destructive">
              {errors.password.message}
            </TypographyMuted>
          )}
        </div>

        {/* Submit */}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full font-semibold shadow-sm shadow-primary/10 [@media(max-height:680px)]:h-10"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Footer */}

      <div className="mt-7 border-t border-border/70 pt-5 [@media(max-height:680px)]:mt-5 [@media(max-height:680px)]:pt-4">
        <TypographyMuted className="text-xs leading-5">
          By signing in, you are accessing a protected Veyra workspace.
        </TypographyMuted>
      </div>
    </div>
  );
}
