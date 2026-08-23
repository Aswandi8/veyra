"use client";

import { useState, useTransition } from "react";

import { Loader2, UserPlus } from "lucide-react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { CreateInvitationResponse } from "@/lib/invitations/types";

import type { AdminRole } from "@/lib/permissions/types";

interface InviteUserDialogProps {
  websiteId: string;
  roles: AdminRole[];
}

export function InviteUserDialog({ websiteId, roles }: InviteUserDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [roleId, setRoleId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const roleItems = roles.map((role) => ({
    value: role.id,

    label: role.name.replaceAll("_", " "),
  }));

  function reset() {
    setName("");
    setEmail("");
    setRoleId(null);
    setError(null);
  }

  async function handleSubmit() {
    const normalizedName = name.trim();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setError("Name is required.");

      return;
    }

    if (!normalizedEmail) {
      setError("Email is required.");

      return;
    }

    if (!roleId) {
      setError("Role is required.");

      return;
    }

    setError(null);

    try {
      const response = await fetch(
        `/api/admin/websites/${encodeURIComponent(websiteId)}/invitations`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: normalizedName,

            email: normalizedEmail,

            roleId,
          }),
        },
      );

      const result = (await response.json()) as CreateInvitationResponse;

      if (!response.ok || !result.success) {
        setError(result.error ?? "Unable to create invitation.");

        return;
      }

      reset();
      setOpen(false);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Central API is unavailable.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (isPending) {
          return;
        }

        setOpen(value);

        if (!value) {
          reset();
        }
      }}
    >
      <DialogTrigger render={<Button type="button" />}>
        <UserPlus className="size-4" />
        Invite member
      </DialogTrigger>

      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>

          <DialogDescription>
            Invite a user to this website and assign their website role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Name</Label>

            <Input
              id="invite-name"
              value={name}
              disabled={isPending}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>

            <Input
              id="invite-email"
              type="email"
              value={email}
              disabled={isPending}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>

            <Select
              items={roleItems}
              value={roleId}
              onValueChange={setRoleId}
              disabled={isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>

              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isPending || roles.length === 0}
            onClick={() => void handleSubmit()}
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
