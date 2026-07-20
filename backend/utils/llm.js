import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const isOpenAIActive = !!process.env.OPENAI_API_KEY;

const baseURL = isOpenAIActive 
  ? 'https://api.openai.com/v1' 
  : (process.env.LOCAL_LLM_BASE_URL || 'http://localhost:11434/v1');

const modelName = isOpenAIActive 
  ? (process.env.OPENAI_MODEL || 'gpt-4o-mini') 
  : (process.env.LOCAL_LLM_MODEL || 'deepseek-r1:14b');

// Initialize the client with standard parameters and custom ngrok-bypass headers
const client = new OpenAI({
  baseURL,
  apiKey: process.env.OPENAI_API_KEY || 'local-no-key-required',
  // Inject the custom ngrok-skip-browser-warning header
  // This instructs ngrok to bypass the HTML interstitial page and route directly to Ollama
  defaultHeaders: {
    'ngrok-skip-browser-warning': 'true'
  }
});

/**
 * Sends a chat completion request to either the local Ollama instance or OpenAI cloud models.
 * @param {Array} messages - Standard chat messages array [{role: 'user', content: '...'}]
 * @param {Object} options - Additional configurations (temperature, response_format, etc.)
 */
export async function getLocalLLMCompletion(messages, options = {}) {
  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.2,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
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
  isOpenAIActive
};