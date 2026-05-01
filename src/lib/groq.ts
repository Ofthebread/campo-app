export const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const GROQ_MODELS = {
  default: "llama-3.3-70b-versatile",
} as const;

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY no está configurada");
}
