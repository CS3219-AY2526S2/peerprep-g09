import { ProfileSettingsForm } from "@/components/profile-settings-form";

export default function ProfileSettingsPage() {
  return (
    <div className="flex w-full h-screen justify-center p-20">
        <main className="w-full max-w-md">
        <ProfileSettingsForm />
        </main>
    </div>
  );
}
