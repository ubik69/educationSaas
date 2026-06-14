"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ReadinessRing } from "@/components/ui/ReadinessRing";
import { cn } from "@/components/ui/cn";

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  skillName: string;
};

export function QuizRunner({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const selected = answers[current?.id];
  const answered = selected !== undefined;
  const isLast = index === questions.length - 1;

  const score = useMemo(
    () =>
      questions.reduce(
        (n, q) => (answers[q.id] === q.correctAnswer ? n + 1 : n),
        0,
      ),
    [answers, questions],
  );

  function choose(option: string) {
    if (answered) return;
    setAnswers((prev) => ({ ...prev, [current.id]: option }));
  }

  function next() {
    if (isLast) setFinished(true);
    else setIndex((i) => i + 1);
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-6">
        <div className="card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
          <ReadinessRing value={pct} label="Score" />
          <div>
            <h2 className="text-xl font-semibold">
              {pct >= 80
                ? "Strong check — that gap is closing."
                : pct >= 50
                  ? "Getting there. One more pass will lock it in."
                  : "This is exactly why it's today's focus."}
            </h2>
            <p className="mt-2 text-muted">
              You scored{" "}
              <span className="font-mono font-semibold text-fg">
                {score}/{questions.length}
              </span>{" "}
              on this check.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={restart} variant="secondary">
                <Icon name="history" size={18} />
                Retry
              </Button>
              <Button href="/dashboard/study">
                Back to session
                <Icon name="arrowRight" size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="card divide-y divide-line">
          {questions.map((q, i) => {
            const a = answers[q.id];
            const correct = a === q.correctAnswer;
            return (
              <div key={q.id} className="flex gap-4 p-5">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full",
                    correct
                      ? "bg-brand/15 text-brand"
                      : "bg-danger/15 text-danger",
                  )}
                >
                  <Icon name={correct ? "check" : "x"} size={14} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="font-mono text-xs text-faint">
                      {String(i + 1).padStart(2, "0")}{" "}
                    </span>
                    {q.question}
                  </p>
                  {!correct && (
                    <p className="mt-1.5 text-xs text-muted">
                      You answered{" "}
                      <span className="text-danger">{a}</span> · correct answer{" "}
                      <span className="text-brand">{q.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-mono text-xs text-faint">
            Question {index + 1} of {questions.length}
          </span>
          <span className="text-xs text-faint">{current.skillName}</span>
        </div>
        <ProgressBar
          value={((index + (answered ? 1 : 0)) / questions.length) * 100}
          tone="brand"
          height="h-1.5"
        />
      </div>

      <div className="card p-6 sm:p-8">
        <h2 className="text-lg font-medium leading-snug">{current.question}</h2>
        <div className="mt-6 space-y-3">
          {current.options.map((option) => {
            const isChosen = selected === option;
            const isCorrect = option === current.correctAnswer;
            const showState = answered;

            return (
              <button
                key={option}
                type="button"
                onClick={() => choose(option)}
                disabled={answered}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-colors",
                  !showState &&
                    "border-line bg-surface-2 hover:border-line-strong hover:bg-surface-3",
                  showState &&
                    isCorrect &&
                    "border-brand/40 bg-brand/[0.08] text-fg",
                  showState &&
                    isChosen &&
                    !isCorrect &&
                    "border-danger/40 bg-danger/[0.08] text-fg",
                  showState &&
                    !isChosen &&
                    !isCorrect &&
                    "border-line opacity-55",
                )}
              >
                <span>{option}</span>
                {showState && isCorrect && (
                  <span className="text-brand">
                    <Icon name="check" size={18} />
                  </span>
                )}
                {showState && isChosen && !isCorrect && (
                  <span className="text-danger">
                    <Icon name="x" size={18} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-faint">
          {answered
            ? selected === current.correctAnswer
              ? "Correct"
              : "Not quite — review and continue"
            : "Pick an answer"}
        </span>
        <Button onClick={next} disabled={!answered}>
          {isLast ? "See results" : "Next question"}
          <Icon name="arrowRight" size={18} />
        </Button>
      </div>
    </div>
  );
}
