import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient } from "@binarylawyer/sushi-deck-kit/generate";

const MODEL = process.env.SUSHI_DECK_LLM_MODEL ?? "claude-opus-4-8";

/**
 * Wraps the Claude API in the kit's `LlmClient` interface. The kit's
 * `generateDeck` handles prompt construction, JSON extraction, validation, and
 * one repair retry — this adapter only has to turn a prompt into text.
 *
 * The Anthropic client is constructed lazily (inside `complete`) so routes that
 * never generate don't require ANTHROPIC_API_KEY to be present.
 */
export function claudeLlm(): LlmClient {
  return {
    async complete(prompt: string): Promise<string> {
      const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env
      const res = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt }],
      });
      return res.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
    },
  };
}
