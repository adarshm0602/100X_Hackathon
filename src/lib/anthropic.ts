import Anthropic from "@anthropic-ai/sdk";

export function getAnthropicClient() {
  const apiKey =
    process.env.ANTHROPIC_API_KEY ?? process.env.ANTROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  return new Anthropic({ apiKey });
}

export function getAnthropicModel() {
  const fromEnv = process.env.ANTHROPIC_MODEL?.trim();
  return fromEnv || "claude-sonnet-4-6";
}

export function parseJsonResponse<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model response did not contain JSON");
  }

  return JSON.parse(candidate.slice(start, end + 1)) as T;
}

export function getTextFromMessage(message: Anthropic.Message) {
  const text = message.content.find((block) => block.type === "text")?.text;

  if (!text) {
    throw new Error("Model response did not include text");
  }

  return text;
}
