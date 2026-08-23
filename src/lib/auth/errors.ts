export function getLoginErrorMessage(code?: string, fallback?: string): string {
  switch (code) {
    case "USER_NOT_FOUND":
      return "Account dengan email tersebut tidak ditemukan.";

    case "INVALID_PASSWORD":
      return "Password yang kamu masukkan salah.";

    case "ACCOUNT_INACTIVE":
      return "Akun kamu sedang tidak aktif. Hubungi administrator.";

    case "ACCOUNT_SUSPENDED":
      return "Akun kamu sedang ditangguhkan.";

    case "ACCOUNT_BANNED":
      return "Akun kamu telah diblokir.";

    case "EMAIL_NOT_VERIFIED":
      return "Email kamu belum diverifikasi.";

    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email atau password tidak valid.";

    case "AUTH_SERVER_UNAVAILABLE":
      return "Server autentikasi sedang tidak tersedia.";

    case "INVALID_REQUEST":
      return "Data login tidak valid.";

    default:
      return fallback || "Login gagal. Silakan coba lagi.";
  }
}

export function getAccountStatusError(status?: string): string | null {
  switch (status) {
    case undefined:
    case "ACTIVE":
      return null;

    case "INACTIVE":
      return "Akun kamu sedang tidak aktif. Hubungi administrator.";

    case "SUSPENDED":
      return "Akun kamu sedang ditangguhkan.";

    case "BANNED":
      return "Akun kamu telah diblokir.";

    default:
      return "Akun kamu tidak dapat digunakan.";
  }
}
