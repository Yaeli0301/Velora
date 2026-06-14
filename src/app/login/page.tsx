import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "התחברות | Velora",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center">טוען…</div>}>
      <LoginForm />
    </Suspense>
  );
}
