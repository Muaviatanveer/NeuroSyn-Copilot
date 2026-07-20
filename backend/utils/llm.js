import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const isGeminiActive = !!process.env.GEMINI_API_KEY;
const isOpenAIActive = !isGeminiActive && !!process.env.OPENAI_API_KEY;

// 1. Resolve base URL dynamically
const baseURL = isGeminiActive
  ? 'https://generativelanguage.googleapis.com/v1beta/openai'
  : isOpenAIActive
    ? 'https://api.openai.com/v1'
    : (process.env.LOCAL_LLM_BASE_URL || 'http://localhost:11434/v1');

// 2. Resolve target model name dynamically
const modelName = isGeminiActive
  ? (process.env.GEMINI_MODEL || 'gemini-1.5-flash')
  : isOpenAIActive
    ? (process.env.OPENAI_MODEL || 'gpt-4o-mini')
    : (process.env.LOCAL_LLM_MODEL || 'deepseek-r1:14b');

// 3. Resolve API Key
const apiKey = isGeminiActive
  ? process.env.GEMINI_API_KEY
  : (process.env.OPENAI_API_KEY || 'local-no-key-required');

// Initialize the OpenAI client pointing to the determined cloud or local provider
const client = new OpenAI({
  baseURL,
  apiKey,
  defaultHeaders: {
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

/**
 * Sends a chat completion request to Gemini, OpenAI, or local Ollama.
 */
export async function getLocalLLMCompletion(messages, options = {}) {
  try {
    // Dynamically omit response_format for Gemini since it is not supported in their beta endpoint
    const response_format = (options.jsonMode && !isGeminiActive) 
      ? { type: 'json_object' } 
      : undefined;

    const response = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.2,
      response_format, // Only passed if not Gemini
      ...options
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