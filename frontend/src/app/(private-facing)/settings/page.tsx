import Link from "next/link";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { DeleteAccount } from "@/components/delete-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfileSettingsPage() {
  return (
    <div className="flex w-full min-h-screen justify-center p-8 bg-gray-50">
      <main className="w-full max-w-2xl space-y-8">
        <ProfileSettingsForm />
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/update-password">
              <Button>Update Password</Button>
            </Link>
          </CardContent>
        </Card>
        <DeleteAccount />
      </main>
    </div>
  );
}
