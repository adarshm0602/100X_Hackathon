import { NextResponse } from "next/server";
import {
  getAnthropicClient,
  getAnthropicModel,
  getTextFromMessage,
  parseJsonResponse,
} from "@/lib/anthropic";

const SYSTEM_PROMPT = `You are a strict technical interviewer evaluating whether a learner truly understands a systems-thinking concept or is reciting a memorized definition.

Your job:
1. Read the concept and the learner's initial explanation carefully.
2. Identify the exact sentence (quote it verbatim in memorized_label) where the learner stopped reasoning from first principles and switched to a memorized label, buzzword, or textbook phrase.
3. Write memorized_label as that quoted sentence, or the shortest exact phrase from their answer that reveals the gap.
4. Generate one sharp follow-up question that forces the learner to derive the concept from scratch and exposes the gap you found.

Rules:
- Be precise and skeptical. Do not praise vague answers.
- The follow-up must target the specific gap, not a generic quiz question.
- Do not explain the concept yourself.
- Respond with strict JSON only. No markdown, no prose, no code fences.

Required JSON shape:
{ "memorized_label": "...", "follow_up_question": "..." }`;

type EvaluateInitialResponse = {
  memorized_label: string;
  follow_up_question: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      concept?: string;
      initial_explanation?: string;
    };

    const concept = body.concept?.trim();
    const initialExplanation = body.initial_explanation?.trim();

    if (!concept || !initialExplanation) {
      return NextResponse.json(
        { error: "concept and initial_explanation are required" },
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
          content: `Concept: ${concept}\n\nInitial explanation:\n${initialExplanation}`,
        },
      ],
    });

    const parsed = parseJsonResponse<EvaluateInitialResponse>(
      getTextFromMessage(message)
    );

    if (!parsed.memorized_label?.trim() || !parsed.follow_up_question?.trim()) {
      return NextResponse.json(
        { error: "Model returned an incomplete JSON response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      memorized_label: parsed.memorized_label.trim(),
      follow_up_question: parsed.follow_up_question.trim(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to evaluate explanation";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
