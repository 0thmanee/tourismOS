import { Suspense } from "react";
import { AuthLayout, LoginForm } from "~/features/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout title="Sign in" subtitle="Welcome back" showRegisterLink>
          <div className="font-sans text-white/50">Loading…</div>
        </AuthLayout>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
