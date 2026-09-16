/**
 * Gemini client.
 *
 * The only file that knows about Google's API. To change AI provider later,
 * rewrite generateJson() and nothing else needs to change.
 */
const { config } = require('../config');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/** Pulls a JSON array out of a model response, tolerating stray prose or fences. */
function extractJsonArray(text) {
  let raw = (text || '').trim()
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const first = raw.indexOf('[');
  const last  = raw.lastIndexOf(']');
  if (first !== -1 && last !== -1) raw = raw.slice(first, last + 1);

  return JSON.parse(raw);
}

/**
 * Sends a prompt and returns parsed JSON.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 */
async function generateJson(systemPrompt, userPrompt) {
  if (!config.gemini.apiKey) {
    throw ApiError.internal('GEMINI_API_KEY is not set on the server.');
  }

  const url = `${config.gemini.baseUrl}/${config.gemini.model}:generateContent`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.gemini.apiKey
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.9,
          maxOutputTokens: 8192
        }
      })
    });
  } catch (err) {
    logger.error('Network error calling Gemini:', err.message);
    throw ApiError.upstream('Could not reach the AI service. Check the server connection.');
  }

  if (!response.ok) {
    const body = await response.text();
    logger.error(`Gemini ${response.status}:`, body.slice(0, 400));

    if (response.status === 429) {
      throw ApiError.rateLimited('Free-tier rate limit reached. Please wait a minute and try again.');
    }
    if (response.status === 404) {
      throw ApiError.upstream(`Model "${config.gemini.model}" is unavailable. Update GEMINI_MODEL in .env`);
    }
    throw ApiError.upstream('The AI service returned an error. Please try again.');
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = (parts || []).map(p => p.text || '').join('\n');

  try {
    return extractJsonArray(text);
  } catch (err) {
    logger.error('Unparseable model output:', text.slice(0, 300));
    throw ApiError.upstream('Could not read the generated questions. Please try again.');
  }
}

module.exports = { generateJson };
