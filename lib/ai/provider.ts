// provider.ts
// The AI seam. Today this returns MOCK content generated from our knowledge base.
// To use a real model later, set AI_PROVIDER and the matching API key in
// .env.local (see .env.example). No call sites need to change — they just call
// generateStudyContent() and get back the same shape regardless of provider.
//
//   AI_PROVIDER=mock        -> deterministic local generation (default, no key)
//   AI_PROVIDER=anthropic   -> calls the Claude API (needs ANTHROPIC_API_KEY)
//   AI_PROVIDER=openai      -> calls the OpenAI API (needs OPENAI_API_KEY)
//
// Real providers fall back to mock automatically if their key is missing or the
// request fails, so the demo never breaks.

import {
  fallbackKnowledge,
  skillKnowledge,
  type SkillKnowledge,
} from "@/lib/ai/knowledge";

export type AiProvider = "mock" | "anthropic" | "openai";

export type StudyContentInput = {
  skillId: string;
  skillName: string;
  skillSetName: string;
  domainName: string;
  accuracy: number;
  attempts: number;
  examWeight: number;
};

export type Flashcard = { front: string; back: string };

export type StudyContent = {
  lessonSummary: string;
  flashcards: Flashcard[];
  remediation: string;
  recommendation: string;
};

export type GeneratedStudyContent = StudyContent & {
  provider: AiProvider;
  model: string;
  generatedAt: string;
};

const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-fable-5";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

/** Which provider is actually usable right now (falls back to mock if a real
 *  provider is selected but its key is missing). */
export function activeProvider(): AiProvider {
  const requested = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (requested === "anthropic" && process.env.ANTHROPIC_API_KEY)
    return "anthropic";
  if (requested === "openai" && process.env.OPENAI_API_KEY) return "openai";
  return "mock";
}

export async function generateStudyContent(
  input: StudyContentInput,
): Promise<GeneratedStudyContent> {
  const provider = activeProvider();
  try {
    if (provider === "anthropic") return await generateWithAnthropic(input);
    if (provider === "openai") return await generateWithOpenAI(input);
  } catch (err) {
    // Never let a flaky API break the experience — degrade to mock.
    console.error(`[ai] ${provider} generation failed, using mock:`, err);
  }
  return generateMock(input);
}

// ---------------------------------------------------------------------------
// Mock provider
// ---------------------------------------------------------------------------

function knowledgeFor(skillId: string): SkillKnowledge {
  return skillKnowledge[skillId] ?? fallbackKnowledge;
}

function performanceFraming(input: StudyContentInput): string {
  if (input.attempts === 0)
    return `You haven't been tested on "${input.skillName}" yet, so we're starting from fundamentals.`;
  if (input.accuracy < 50)
    return `Your accuracy on "${input.skillName}" is ${input.accuracy}% across ${input.attempts} attempts — this is your biggest single lever right now.`;
  if (input.accuracy < 80)
    return `You're at ${input.accuracy}% on "${input.skillName}" — close, but not yet exam-safe. Let's lock it in.`;
  return `You're strong on "${input.skillName}" (${input.accuracy}%). A quick refresh keeps it sharp.`;
}

export function generateMock(input: StudyContentInput): GeneratedStudyContent {
  const k = knowledgeFor(input.skillId);
  const lessonSummary = `${performanceFraming(input)} ${k.lesson}`;
  const recommendation =
    `Focus today's session on "${input.skillName}" in the ${input.domainName} domain ` +
    `(${input.examWeight}% of the exam). Read the summary, run the 3 flashcards until ` +
    `they're automatic, then take the 5-question check to confirm the gap is closed.`;

  return {
    lessonSummary,
    flashcards: k.flashcards,
    remediation: k.remediation,
    recommendation,
    provider: "mock",
    model: "adept-mock-engine",
    generatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Real providers (opt-in). Kept intentionally simple: one structured-JSON call.
// ---------------------------------------------------------------------------

function buildPrompt(input: StudyContentInput): string {
  return [
    `You are an expert AWS Certified Cloud Practitioner (CLF-C02) tutor.`,
    `Create a personalised micro-lesson for a learner who needs to improve this skill:`,
    ``,
    `Skill: ${input.skillName}`,
    `Skill set: ${input.skillSetName}`,
    `Domain: ${input.domainName} (${input.examWeight}% of the exam)`,
    `Learner accuracy on this skill: ${input.accuracy}% over ${input.attempts} attempts`,
    ``,
    `Respond with ONLY valid JSON matching this TypeScript type, no markdown:`,
    `{ "lessonSummary": string (2-3 sentences),`,
    `  "flashcards": { "front": string, "back": string }[] (exactly 3),`,
    `  "remediation": string (1-2 sentences of targeted advice),`,
    `  "recommendation": string (1-2 sentences on how to study this today) }`,
  ].join("\n");
}

function coerceContent(
  raw: unknown,
  provider: AiProvider,
  model: string,
  fallback: StudyContentInput,
): GeneratedStudyContent {
  const obj = (raw ?? {}) as Partial<StudyContent>;
  const mock = generateMock(fallback);
  return {
    lessonSummary: obj.lessonSummary?.trim() || mock.lessonSummary,
    flashcards:
      Array.isArray(obj.flashcards) && obj.flashcards.length > 0
        ? obj.flashcards.slice(0, 3)
        : mock.flashcards,
    remediation: obj.remediation?.trim() || mock.remediation,
    recommendation: obj.recommendation?.trim() || mock.recommendation,
    provider,
    model,
    generatedAt: new Date().toISOString(),
  };
}

async function generateWithAnthropic(
  input: StudyContentInput,
): Promise<GeneratedStudyContent> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: DEFAULT_ANTHROPIC_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  const text: string = data?.content?.[0]?.text ?? "{}";
  return coerceContent(
    safeJson(text),
    "anthropic",
    DEFAULT_ANTHROPIC_MODEL,
    input,
  );
}

async function generateWithOpenAI(
  input: StudyContentInput,
): Promise<GeneratedStudyContent> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildPrompt(input) }],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}`);
  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "{}";
  return coerceContent(safeJson(text), "openai", DEFAULT_OPENAI_MODEL, input);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Models sometimes wrap JSON in prose or code fences — grab the first object.
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : {};
  }
}
