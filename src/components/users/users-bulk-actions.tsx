"use client";

import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  PauseCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { ConfirmDialog } from "@/components/common/dialog/confirm-dialog";
import { DataTableBulkActions } from "@/components/common/data-table/data-table-bulk-actions";
import { useDataTableNavigation } from "@/components/common/data-table/data-table-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserMutationResponse } from "@/lib/users/types";

interface UsersBulkActionsProps {
  selectedIds: readonly string[];
  canUpdate: boolean;
  canDelete: boolean;
  onSuccess: () => void;
}

type BulkStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export function UsersBulkActions({
  selectedIds,
  canUpdate,
  canDelete,
  onSuccess,
}: UsersBulkActionsProps) {
  const { refresh } = useDataTableNavigation();
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function updateStatus(status: BulkStatus) {
    if (selectedIds.length === 0 || loading) return;

    setLoading(status);

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedIds, status }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as UserMutationResponse | null;

      if (!response.ok) {
        throw new Error(
          data?.error || `Unable to update users (${response.status})`,
        );
      }

      toast.success(data?.message || "Users updated successfully.");
      onSuccess();
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update users.",
      );
    } finally {
      setLoading(null);
    }
  }

  async function deleteUsers() {
    if (selectedIds.length === 0 || loading) return;

    setLoading("DELETE");

    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = (await response
        .json()
        .catch(() => null)) as UserMutationResponse | null;

      if (!response.ok) {
        throw new Error(
          data?.error || `Unable to delete users (${response.status})`,
        );
      }

      toast.success(data?.message || "Users deleted successfully.");
      setDeleteOpen(false);
      onSuccess();
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete users.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <DataTableBulkActions selectedCount={selectedIds.length}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                disabled={Boolean(loading)}
              />
            }
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Actions
            <ChevronDown className="ml-2 size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="min-w-44">
            {canUpdate && (
              <>
                <DropdownMenuItem onClick={() => void updateStatus("ACTIVE")}>
                  <CheckCircle2 />
                  Activate
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => void updateStatus("INACTIVE")}>
                  <XCircle />
                  Set inactive
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => void updateStatus("SUSPENDED")}
                >
                  <PauseCircle />
                  Suspend
                </DropdownMenuItem>
              </>
            )}

            {canUpdate && canDelete && <DropdownMenuSeparator />}

            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </DataTableBulkActions>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete selected users?"
        description={`You are about to permanently delete ${selectedIds.length} selected user${selectedIds.length === 1 ? "" : "s"}. This action cannot be undone.`}
        confirmLabel="Delete users"
        loading={loading === "DELETE"}
        destructive
        onConfirm={() => void deleteUsers()}
      />
    </>
  );
}
