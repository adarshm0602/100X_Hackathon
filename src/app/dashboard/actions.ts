"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

type ActionResult<T> =
  | { error: string; data?: never }
  | { error?: never; data: T };

export async function createSession(
  concept: string
): Promise<ActionResult<{ sessionId: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, concept_tested: concept })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create session." };
  }

  return { data: { sessionId: data.id } };
}

export async function createGap(input: {
  sessionId: string;
  initialExplanation: string;
  memorizedLabel: string;
  followUpQuestion: string;
}): Promise<
  ActionResult<{
    gapId: string;
    memorizedLabel: string;
    followUpQuestion: string;
  }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { data, error } = await supabase
    .from("gaps")
    .insert({
      session_id: input.sessionId,
      initial_explanation: input.initialExplanation,
      memorized_label: input.memorizedLabel,
      follow_up_question: input.followUpQuestion,
    })
    .select("id, memorized_label, follow_up_question")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to save gap analysis." };
  }

  return {
    data: {
      gapId: data.id,
      memorizedLabel: data.memorized_label,
      followUpQuestion: data.follow_up_question,
    },
  };
}

export async function createResult(input: {
  gapId: string;
  secondAttempt: string;
  isGapClosed: boolean;
}): Promise<ActionResult<{ isGapClosed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  const { error } = await supabase.from("results").insert({
    gap_id: input.gapId,
    second_attempt: input.secondAttempt,
    is_gap_closed: input.isGapClosed,
  });

  if (error) {
    return { error: error.message };
  }

  return { data: { isGapClosed: input.isGapClosed } };
}
