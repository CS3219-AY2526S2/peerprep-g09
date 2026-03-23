import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex h-screen justify-center gap-x-6 p-20">
      <main className="flex w-full max-w-md flex-col gap-y-10">
        <LoginForm />
      </main>
    </div>
  );
}
