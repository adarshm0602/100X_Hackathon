import { NextResponse } from "next/server";
import {
  getAnthropicClient,
  getAnthropicModel,
  getTextFromMessage,
  parseJsonResponse,
} from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a strict technical judge. Your only job is to decide whether a learner successfully derived a concept in their second attempt after being challenged with a follow-up question.

Judge strictly:
- true only if the second attempt shows causal reasoning, directly addresses the follow-up, and goes beyond repeating memorized phrases.
- false if the answer is vague, evasive, repeats the original definition, or fails to derive the mechanism from first principles.

Your feedback must be concise, direct, and specific to what the learner did or failed to do. Do not teach the full answer.

Respond with strict JSON only. No markdown, no prose, no code fences.

Required JSON shape:
{ "is_gap_closed": true, "feedback": "..." }
or
{ "is_gap_closed": false, "feedback": "..." }`;

type EvaluateSecondResponse = {
  is_gap_closed: boolean;
  feedback: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      concept?: string;
      follow_up_question?: string;
      second_attempt?: string;
    };

    const concept = body.concept?.trim();
    const followUpQuestion = body.follow_up_question?.trim();
    const secondAttempt = body.second_attempt?.trim();

    if (!concept || !followUpQuestion || !secondAttempt) {
      return NextResponse.json(
        {
          error: "concept, follow_up_question, and second_attempt are required",
        },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: getAnthropicModel(),
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            `Concept: ${concept}`,
            `Follow-up question: ${followUpQuestion}`,
            `Second attempt: ${secondAttempt}`,
          ].join("\n\n"),
        },
      ],
    });

    const parsed = parseJsonResponse<EvaluateSecondResponse>(
      getTextFromMessage(message)
    );

    if (typeof parsed.is_gap_closed !== "boolean" || !parsed.feedback?.trim()) {
      return NextResponse.json(
        { error: "Model returned an incomplete JSON response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      is_gap_closed: parsed.is_gap_closed,
      feedback: parsed.feedback.trim(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate second attempt";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
