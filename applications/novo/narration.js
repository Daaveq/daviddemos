// Single source of truth for the narrator. Used by the page (captions, timing)
// and by scripts/generate-voice.mjs (OpenAI text-to-speech).

export const VOICE = {
  model: "gpt-4o-mini-tts",
  voice: "ash",
  instructions:
    "You are the warm narrator of a short, upbeat film. Speak clear English at a brisk, " +
    "energetic pace with quiet confidence and a hint of a smile. Keep pauses short. " +
    "Never sound like an advert.",
};

export const LINES = [
  { id: "a1", text: "Good morning, Novo Nordisk." },
  { id: "a2", text: "This is David's official application to join your AI Upskilling and Adoption team." },
  { id: "a3", text: "Before we begin, let's start with a story." },
  { id: "b1", text: "Picture a company that gives everyone an AI assistant on a Monday." },
  { id: "b2", text: "Launch week: a keynote, applause, and everybody tries it." },
  { id: "b3", text: "Six weeks later, most people work exactly the way they did before." },
  { id: "b4", text: "The tools worked. The habit never formed." },
  { id: "b5", text: "That gap is the job. Here is what David would do in your shoes." },
  { id: "d1", text: "Six weeks on, for one colleague: one prompt this week, and no new habits." },
  { id: "e1", text: "A licence is not a habit. Neither is a keynote, or a demo. The habit is the job." },
  { id: "f1", text: "So I would start where the requests are." },
  { id: "f2", text: "Take one real ask, and turn it into forty-five minutes, hands on, with approved tools." },
  { id: "f3", text: "And answer the same day." },
  { id: "g1", text: "Finance, research, production, legal, leadership. Each one gets its own way in." },
  { id: "h1", text: "And every session leaves something behind, so the next one starts ahead." },
  { id: "c1", text: "You already have the tools. I would love to help your people make them a habit." },
];
