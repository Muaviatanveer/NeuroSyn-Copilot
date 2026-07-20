import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const isGeminiActive = !!process.env.GEMINI_API_KEY;
const isOpenAIActive = !isGeminiActive && !!process.env.OPENAI_API_KEY;

const baseURL = isGeminiActive
  ? 'https://generativelanguage.googleapis.com/v1beta/openai'
  : isOpenAIActive
    ? 'https://api.openai.com/v1'
    : (process.env.LOCAL_LLM_BASE_URL || 'http://localhost:11434/v1');

const modelName = isGeminiActive
  ? (process.env.GEMINI_MODEL || 'gemini-3.5-flash')
  : isOpenAIActive
    ? (process.env.OPENAI_MODEL || 'gpt-4o-mini')
    : (process.env.LOCAL_LLM_MODEL || 'deepseek-r1:14b');

const apiKey = isGeminiActive
  ? process.env.GEMINI_API_KEY
  : (process.env.OPENAI_API_KEY || 'local-no-key-required');

const client = new OpenAI({
  baseURL,
  apiKey,
  defaultHeaders: {
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

/**
 * Sends a chat completion request to Gemini, OpenAI, or local Ollama safely.
 */
export async function getLocalLLMCompletion(messages, options = {}) {
  try {
    // 1. Isolate temperature safely
    const temperature = options.temperature ?? 0.2;

    // 2. Format response_format strictly (Omitted entirely for Gemini)
    const response_format = (options.jsonMode && !isGeminiActive) 
      ? { type: 'json_object' } 
      : undefined;

    // 3. Construct the clean API payload (No "...options" to prevent leaking custom flags)
    const response = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature,
      response_format
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`[LLM Connector Error] Connection failed to model: ${modelName} at base: ${baseURL}.`, error.message);
    throw error;
  }
}

export const llmConfig = {
  baseURL,
  modelName,
  isCloudActive: isGeminiActive || isOpenAIActive
};