// Single source of truth for the narrator. Used by the page (captions, timing)
// and by scripts/generate-voice.mjs (OpenAI text-to-speech).

export const VOICE = {
  model: "gpt-4o-mini-tts",
  voice: "ash",
  instructions:
    "You are the calm, warm narrator of a short film. Speak in clear, unhurried English " +
    "with quiet confidence and a hint of a smile. Natural pauses at commas and full stops. " +
    "Never sound like an advert.",
};

export const LINES = [
  { id: "a1", text: "Good morning, Novo Nordisk." },
  { id: "a2", text: "This is David's official application to join your AI Upskilling and Adoption team." },
  { id: "a3", text: "Before we begin, let's start with a story." },
  { id: "b1", text: "Picture a company that gives everyone an AI assistant on a Monday." },
  { id: "b2", text: "There's a keynote. There's applause. For one week, everybody tries it." },
  { id: "b3", text: "Six weeks later, most people are back to working exactly the way they did before." },
  { id: "b4", text: "The tools worked. The habit never formed." },
  { id: "b5", text: "That gap is the job. So here is what David would do, if he were in your shoes." },
  { id: "c1", text: "You already have the tools. I would love to help your people make them a habit." },
];
