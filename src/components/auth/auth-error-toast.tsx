"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

interface AuthErrorToastProps {
  error?: string;
}

export function AuthErrorToast({ error }: AuthErrorToastProps) {
  useEffect(() => {
    if (!error) {
      return;
    }

    switch (error) {
      case "account-inactive":
        toast.error("Akun kamu sedang tidak aktif. Hubungi administrator.");
        break;

      case "account-suspended":
        toast.error("Akun kamu sedang ditangguhkan.");
        break;

      case "account-banned":
        toast.error("Akun kamu telah diblokir.");
        break;

      case "email-not-verified":
        toast.error("Email kamu belum diverifikasi.");
        break;

      case "session-expired":
        toast.error("Session kamu telah berakhir. Silakan login kembali.");
        break;

      case "idle-timeout":
        toast.error("Kamu telah logout otomatis karena tidak ada aktivitas.");
        break;

      case "admin-access-required":
        toast.error("Akun kamu tidak memiliki akses ke dashboard.");
        break;

      default:
        break;
    }
  }, [error]);

  return null;
}
