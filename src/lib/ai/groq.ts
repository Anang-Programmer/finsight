import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const AI_MODEL = 'llama-3.3-70b-versatile';

export async function chatCompletion(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
) {
  const response = await groq.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1024,
  });

  return response;
}

export async function chatCompletionStream(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
) {
  const stream = await groq.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  });

  return stream;
}

export { groq };
