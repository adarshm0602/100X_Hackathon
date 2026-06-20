"use client";

import { useState } from "react";
import { CONCEPTS } from "@/lib/concepts";
import {
  createGap,
  createResult,
  createSession,
} from "./actions";

type Step = 1 | 2 | 3;

type GapData = {
  gapId: string;
  memorizedLabel: string;
  followUpQuestion: string;
};

export function ConceptChecker() {
  const [step, setStep] = useState<Step>(1);
  const [concept, setConcept] = useState<string>(CONCEPTS[0]);
  const [initialExplanation, setInitialExplanation] = useState("");
  const [secondAttempt, setSecondAttempt] = useState("");
  const [gapData, setGapData] = useState<GapData | null>(null);
  const [isGapClosed, setIsGapClosed] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInitialSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setStep(2);
    setLoadingGap(true);
    setGapData(null);

    try {
      const sessionResult = await createSession(concept);
      if (sessionResult.error || !sessionResult.data) {
        setError(sessionResult.error ?? "Failed to create session.");
        setStep(1);
        return;
      }

      const { sessionId } = sessionResult.data;

      const analyzeResponse = await fetch("/api/evaluate-initial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          initial_explanation: initialExplanation,
        }),
      });

      if (!analyzeResponse.ok) {
        const payload = (await analyzeResponse.json()) as { error?: string };
        setError(payload.error ?? "Failed to analyze your explanation.");
        setStep(1);
        return;
      }

      const analysis = (await analyzeResponse.json()) as {
        memorized_label: string;
        follow_up_question: string;
      };

      const gapResult = await createGap({
        sessionId,
        initialExplanation,
        memorizedLabel: analysis.memorized_label,
        followUpQuestion: analysis.follow_up_question,
      });

      if (gapResult.error || !gapResult.data) {
        setError(gapResult.error ?? "Failed to save gap analysis.");
        setStep(1);
        return;
      }

      setGapData({
        gapId: gapResult.data.gapId,
        memorizedLabel: gapResult.data.memorizedLabel,
        followUpQuestion: gapResult.data.followUpQuestion,
      });
    } catch {
      setError("Something went wrong. Please try again.");
      setStep(1);
    } finally {
      setLoadingGap(false);
    }
  }

  async function handleSecondSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!gapData) return;

    setError(null);
    setLoadingVerdict(true);

    try {
      const evaluateResponse = await fetch("/api/evaluate-second", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          follow_up_question: gapData.followUpQuestion,
          second_attempt: secondAttempt,
        }),
      });

      if (!evaluateResponse.ok) {
        const payload = (await evaluateResponse.json()) as { error?: string };
        setError(payload.error ?? "Failed to evaluate your second attempt.");
        return;
      }

      const verdict = (await evaluateResponse.json()) as {
        is_gap_closed: boolean;
        feedback: string;
      };

      const result = await createResult({
        gapId: gapData.gapId,
        secondAttempt,
        isGapClosed: verdict.is_gap_closed,
      });

      if (result.error || !result.data) {
        setError(result.error ?? "Failed to save result.");
        return;
      }

      setIsGapClosed(result.data.isGapClosed);
      setFeedback(verdict.feedback);
      setStep(3);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingVerdict(false);
    }
  }

  function handleStartOver() {
    setStep(1);
    setConcept(CONCEPTS[0]);
    setInitialExplanation("");
    setSecondAttempt("");
    setGapData(null);
    setIsGapClosed(null);
    setFeedback(null);
    setLoadingGap(false);
    setLoadingVerdict(false);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={
              step === n
                ? "rounded-full bg-zinc-900 px-2.5 py-1 text-white"
                : step > n
                  ? "rounded-full bg-zinc-200 px-2.5 py-1 text-zinc-700"
                  : "rounded-full border border-zinc-200 px-2.5 py-1"
            }
          >
            Step {n}
          </span>
        ))}
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {step === 1 && (
        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="concept"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Concept
            </label>
            <select
              id="concept"
              value={concept}
              onChange={(event) => setConcept(event.target.value)}
              disabled={loadingGap}
              className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            >
              {CONCEPTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="initialExplanation"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Initial Explanation
            </label>
            <textarea
              id="initialExplanation"
              value={initialExplanation}
              onChange={(event) => setInitialExplanation(event.target.value)}
              required
              rows={6}
              disabled={loadingGap}
              placeholder="Explain the concept in your own words..."
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loadingGap || !initialExplanation.trim()}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {loadingGap ? (
            <div className="rounded border border-zinc-200 bg-zinc-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-zinc-900">
                Analyzing your explanation...
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Looking for where memorized definitions end and real understanding begins.
              </p>
            </div>
          ) : gapData ? (
            <>
              <div className="rounded border border-amber-200 bg-amber-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-800">
                  Memorized Label
                </p>
                <p className="text-sm font-medium text-amber-950">
                  {gapData.memorizedLabel}
                </p>
              </div>

              <div className="rounded border border-zinc-200 bg-zinc-50 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Follow-up Question
                </p>
                <p className="text-sm text-zinc-900">{gapData.followUpQuestion}</p>
              </div>
            </>
          ) : null}

          {!loadingGap && gapData && (
          <form onSubmit={handleSecondSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="secondAttempt"
                className="mb-1 block text-sm font-medium text-zinc-700"
              >
                Second Attempt
              </label>
              <textarea
                id="secondAttempt"
                value={secondAttempt}
                onChange={(event) => setSecondAttempt(event.target.value)}
                required
                rows={6}
                disabled={loadingVerdict}
                placeholder="Try again with a concrete scenario or causal chain..."
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingVerdict || !secondAttempt.trim()}
              className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {loadingVerdict ? "Checking..." : "Submit"}
            </button>
          </form>
          )}
        </div>
      )}

      {step === 3 && isGapClosed !== null && (
        <div className="space-y-4">
          <div
            className={
              isGapClosed
                ? "rounded border border-green-200 bg-green-50 p-6 text-center"
                : "rounded border border-red-200 bg-red-50 p-6 text-center"
            }
          >
            <p
              className={
                isGapClosed
                  ? "text-lg font-semibold text-green-800"
                  : "text-lg font-semibold text-red-800"
              }
            >
              {isGapClosed ? "Gap Closed" : "Still Stuck"}
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              {feedback ??
                (isGapClosed
                  ? "Your second attempt shows genuine understanding beyond the memorized definition."
                  : "Your second attempt still relies on surface-level reasoning. Review the follow-up and try another scenario.")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartOver}
            className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Try another concept
          </button>
        </div>
      )}
    </div>
  );
}
