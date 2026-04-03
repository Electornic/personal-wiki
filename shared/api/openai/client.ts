import OpenAI from "openai";

import { getOpenAIApiKey } from "@/shared/config/env";

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) return null;

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}
