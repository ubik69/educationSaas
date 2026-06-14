# Adept — a StudyTech personalisation engine

Adept is a mock SaaS demo for IT-certification prep. It maps a certification
down to the individual skill, reads a learner's quiz attempts, finds where
they're weakest, and builds a personalised "Today's Study Session" around that
gap — including one AI-assisted feature.

This prototype uses the **AWS Certified Cloud Practitioner (CLF-C02)** exam as
its example. All data is mocked (`lib/data.ts`).

## Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), click **Get started**, then
**Sign in to demo** — there's no real auth, one press logs you in.

## What's inside

- **Landing page** (`/`) — marketing site for the product.
- **Mock sign-in** (`/login`) — one click, no credentials checked.
- **Dashboard** (`/dashboard`) — the personalisation engine:
  - Overview: exam readiness, weakest skills, domain breakdown, recent attempts.
  - Today's session (`/dashboard/study`): weakest skill, why it was chosen, an
    **AI lesson summary**, flashcards, remediation, and a 5-question plan.
  - Curriculum (`/dashboard/curriculum`): the full cert → domain → skill set →
    skill tree with per-skill mastery.
  - Practice quiz (`/dashboard/quiz`): an interactive, self-scoring check.
  - Attempt history (`/dashboard/attempts`): the raw signal the engine reads.

## The personalisation engine

`lib/personalization.ts` is pure, framework-free TypeScript. It computes
per-skill accuracy and mastery, exam-weighted domain readiness, a weakest-skill
ranking, and the recommended study session (skill + reason + 5-question plan).

## The AI feature (mock now, real later)

The AI seam lives in `lib/ai/provider.ts`. It defaults to **mock** generation
(grounded in `lib/ai/knowledge.ts`) so there's no key or cost. To use a real
model, copy `.env.example` to `.env.local` and set:

```bash
AI_PROVIDER=anthropic        # or: openai
ANTHROPIC_API_KEY=sk-ant-... # matching key
```

No call sites change — `generateStudyContent()` returns the same shape for every
provider, and real providers fall back to mock if the key is missing or a call
fails. The endpoint is `GET /api/ai/study-session?skillId=...`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4. No other
runtime dependencies.
