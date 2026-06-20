"use client";

import { useActionState } from "react";
import { AuthForm } from "@/components/auth-form";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, {
    error: null,
  });

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      pending={pending}
      error={state.error}
      alternateHref="/signup"
      alternateLabel="Create an account"
      formAction={formAction}
      passwordAutoComplete="current-password"
    />
  );
}
