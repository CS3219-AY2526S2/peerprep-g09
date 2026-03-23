import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex h-screen justify-center p-20">
      <main className="w-full max-w-md">
        <LoginForm />
      </main>
    </div>
  );
}
