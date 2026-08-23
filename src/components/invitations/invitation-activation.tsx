"use client";

import * as React from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TypographyMuted } from "@/components/ui/typography";

import type {
  ActivateInvitationResponse,
  VerifyInvitationData,
  VerifyInvitationResponse,
} from "@/lib/invitations/types";

interface InvitationActivationProps {
  token: string;
}

type InvitationPageState =
  | {
      status: "loading";
    }
  | {
      status: "invalid";
      message: string;
    }
  | {
      status: "ready";
      invitation: VerifyInvitationData;
    }
  | {
      status: "success";
      invitation: VerifyInvitationData;
      existingUser: boolean;
    };

function getVerifyError(
  status: number,
  response: VerifyInvitationResponse,
): string {
  if (status === 410) {
    return response.error ?? "Invitation ini sudah tidak berlaku.";
  }

  if (status === 404) {
    return response.error ?? "Invitation tidak ditemukan.";
  }

  return response.error ?? "Invitation tidak dapat diverifikasi.";
}

export function InvitationActivation({ token }: InvitationActivationProps) {
  const router = useRouter();

  const [state, setState] = React.useState<InvitationPageState>({
    status: "loading",
  });

  const [password, setPassword] = React.useState("");

  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [showPassword, setShowPassword] = React.useState(false);

  const [submitting, setSubmitting] = React.useState(false);

  /* ============================================================
   * VERIFY
   * ============================================================ */

  React.useEffect(() => {
    const controller = new AbortController();

    async function verifyInvitation() {
      try {
        const response = await fetch("/api/auth/invitations/verify", {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
          }),

          cache: "no-store",

          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";

        if (!contentType.includes("application/json")) {
          if (!controller.signal.aborted) {
            setState({
              status: "invalid",
              message: "Server mengembalikan response yang tidak valid.",
            });
          }

          return;
        }

        const result = (await response.json()) as VerifyInvitationResponse;

        if (!response.ok || !result.success || !result.data) {
          if (!controller.signal.aborted) {
            setState({
              status: "invalid",

              message: getVerifyError(response.status, result),
            });
          }

          return;
        }

        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "ready",
          invitation: result.data,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("[INVITATION VERIFY]", error);

        if (!controller.signal.aborted) {
          setState({
            status: "invalid",
            message: "Tidak dapat terhubung ke invitation server.",
          });
        }
      }
    }

    void verifyInvitation();

    return () => {
      controller.abort();
    };
  }, [token]);

  /* ============================================================
   * ACTIVATE
   * ============================================================ */

  async function activateInvitation() {
    if (state.status !== "ready") {
      return;
    }

    const invitation = state.invitation;

    if (invitation.requiresPassword) {
      if (password.length < 8) {
        toast.error("Password minimal 8 karakter.");

        return;
      }

      if (password.length > 128) {
        toast.error("Password maksimal 128 karakter.");

        return;
      }

      if (password !== confirmPassword) {
        toast.error("Konfirmasi password tidak sama.");

        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/invitations/activate", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        cache: "no-store",

        body: JSON.stringify({
          token,

          ...(invitation.requiresPassword
            ? {
                password,
              }
            : {}),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        toast.error("Server mengembalikan response yang tidak valid.");

        return;
      }

      const result = (await response.json()) as ActivateInvitationResponse;

      if (!response.ok || !result.success) {
        /*
         * Existing user belum login.
         */
        if (result.code === "LOGIN_REQUIRED") {
          const callbackUrl = `/invite?token=${encodeURIComponent(token)}`;

          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);

          return;
        }

        if (result.code === "ACCOUNT_MISMATCH") {
          toast.error("Akun yang sedang login berbeda dari email invitation.");

          return;
        }

        toast.error(result.error ?? "Invitation gagal diaktifkan.");

        return;
      }

      setState({
        status: "success",

        invitation,

        existingUser: invitation.existingUser,
      });

      toast.success("Invitation berhasil diaktifkan.");
    } catch (error) {
      console.error("[INVITATION ACTIVATE]", error);

      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================================================
   * LOADING
   * ============================================================ */

  if (state.status === "loading") {
    return (
      <Card className="w-full">
        <CardContent className="flex min-h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-7 animate-spin text-muted-foreground" />

            <TypographyMuted>Verifying invitation...</TypographyMuted>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ============================================================
   * INVALID
   * ============================================================ */

  if (state.status === "invalid") {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Invitation unavailable</CardTitle>

          <CardDescription>{state.message}</CardDescription>
        </CardHeader>

        <CardFooter>
          <Button className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /* ============================================================
   * SUCCESS
   * ============================================================ */

  if (state.status === "success") {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" />
          </div>

          <CardTitle>Invitation accepted</CardTitle>

          <CardDescription>
            Kamu sekarang memiliki akses ke{" "}
            <strong>{state.invitation.website.name}</strong> sebagai{" "}
            <strong>{state.invitation.role.name.replaceAll("_", " ")}</strong>.
          </CardDescription>
        </CardHeader>

        <CardFooter>
          {state.existingUser ? (
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                router.replace("/dashboard");

                router.refresh();
              }}
            >
              Continue to dashboard
            </Button>
          ) : (
            <Button className="w-full">
              <Link href="/login">Sign in to Veyra</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  const invitation = state.invitation;

  /* ============================================================
   * EXISTING USER
   * ============================================================ */

  if (invitation.requiresLogin) {
    const callbackUrl = `/invite?token=${encodeURIComponent(token)}`;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>

          <CardDescription>
            Kamu diundang untuk bergabung dengan{" "}
            <strong>{invitation.website.name}</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="space-y-1">
              <TypographyMuted className="text-xs">Email</TypographyMuted>

              <p className="font-medium">{invitation.email}</p>
            </div>

            <div className="mt-4 space-y-1">
              <TypographyMuted className="text-xs">Website</TypographyMuted>

              <p className="font-medium">{invitation.website.name}</p>
            </div>

            <div className="mt-4 space-y-1">
              <TypographyMuted className="text-xs">Role</TypographyMuted>

              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="size-4" />

                {invitation.role.name.replaceAll("_", " ")}
              </div>
            </div>
          </div>

          <TypographyMuted>
            Email ini sudah memiliki akun Veyra. Login menggunakan akun tersebut
            untuk menerima invitation.
          </TypographyMuted>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button className="w-full">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            >
              Sign in to continue
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={submitting}
            onClick={() => void activateInvitation()}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}I am
            already signed in
          </Button>
        </CardFooter>
      </Card>
    );
  }

  /* ============================================================
   * NEW USER
   * ============================================================ */

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activate your Veyra account</CardTitle>

        <CardDescription>
          Buat password untuk menyelesaikan akun dan bergabung dengan{" "}
          <strong>{invitation.website.name}</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/30 p-4">
          <div>
            <TypographyMuted className="text-xs">Name</TypographyMuted>

            <p className="font-medium">{invitation.name}</p>
          </div>

          <div className="mt-4">
            <TypographyMuted className="text-xs">Email</TypographyMuted>

            <p className="font-medium">{invitation.email}</p>
          </div>

          <div className="mt-4">
            <TypographyMuted className="text-xs">Website</TypographyMuted>

            <p className="font-medium">{invitation.website.name}</p>
          </div>

          <div className="mt-4">
            <TypographyMuted className="text-xs">Role</TypographyMuted>

            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4" />

              {invitation.role.name.replaceAll("_", " ")}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={submitting}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              className="pl-9 pr-10"
            />

            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>

          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            disabled={submitting}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat password"
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          disabled={submitting}
          onClick={() => void activateInvitation()}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Activating...
            </>
          ) : (
            "Activate account"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
