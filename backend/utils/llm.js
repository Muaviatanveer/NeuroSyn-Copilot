import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.LOCAL_LLM_BASE_URL || 'http://localhost:11434/v1';
const modelName = process.env.LOCAL_LLM_MODEL || 'llama3';

// Initialize the client pointing to the local runner endpoint
const localClient = new OpenAI({
  baseURL,
  apiKey: process.env.LOCAL_LLM_API_KEY || 'local-no-key-required'
});

/**
 * Sends a chat completion request to the local LLM.
 * @param {Array} messages - standard chat messages array [{role: 'user', content: '...'}]
 * @param {Object} options - additional configurations (temperature, response_format, etc.)
 */
export async function getLocalLLMCompletion(messages, options = {}) {
  try {
    const response = await localClient.chat.completions.create({
      model: modelName,
      messages,
      temperature: options.temperature ?? 0.2,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
      ...options
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[Local LLM Error]: Failed to generate completion.', error.message);
    throw error;
  }
}

export const llmConfig = {
  baseURL,
  modelName
};