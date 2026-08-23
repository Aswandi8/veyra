import { InvitationActivation } from "@/components/invitations/invitation-activation";

import { ThemeToggle } from "@/components/common/theme-toggle";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InvitePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const { token } = await searchParams;

  return (
    <>
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          {!token ? (
            <Card>
              <CardHeader>
                <CardTitle>Invalid invitation</CardTitle>

                <CardDescription>Invitation token is missing.</CardDescription>
              </CardHeader>

              <CardContent className="text-sm text-muted-foreground">
                Request a new invitation from your administrator.
              </CardContent>
            </Card>
          ) : (
            <InvitationActivation token={token} />
          )}
        </div>
      </main>
    </>
  );
}
