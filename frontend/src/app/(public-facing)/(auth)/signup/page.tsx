import { SignupForm } from "@/components/signup-form";

export default function Page() {
  return (
    <div className="flex h-screen justify-center p-20">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </div>
  );
}
