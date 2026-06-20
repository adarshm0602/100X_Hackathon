"use client";

import { useActionState } from "react";
import { AuthForm } from "@/components/auth-form";
import { signup } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, {
    error: null,
  });

  return (
    <AuthForm
      title="Sign up"
      submitLabel="Create account"
      pending={pending}
      error={state.error}
      alternateHref="/login"
      alternateLabel="Already have an account? Log in"
      formAction={formAction}
      passwordAutoComplete="new-password"
    />
  );
}
