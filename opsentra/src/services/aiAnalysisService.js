'use strict';

/**
 * aiAnalysisService — uses Gemini 2.0 Flash to analyze ERROR/FATAL log
 * messages and return a human-readable cause + suggested fix command.
 *
 * Fully fault-tolerant: if the API key is missing, quota is exceeded, or
 * the network call fails, this returns null so the alert email still sends
 * without an AI section — existing flow is never broken.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const MODEL_NAME = 'gemini-2.0-flash';
// Hard cap so we never block the worker for too long
const TIMEOUT_MS = 10_000;

let genAI = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

/**
 * Build the prompt sent to Gemini.
 * @param {string[]} messages - raw log message strings (max 10)
 * @returns {string}
 */
const buildPrompt = (messages) => {
  const logBlock = messages
    .slice(0, 10)
    .map((m, i) => `[${i + 1}] ${m.slice(0, 300)}`)
    .join('\n');

  return `You are an expert DevOps / SRE engineer analyzing server logs.

The following ERROR or FATAL log messages were detected on a production server:

${logBlock}

Respond in this exact JSON format (no markdown, no explanation outside JSON):
{
  "cause": "One sentence: most likely root cause of these errors",
  "fix": "The single most effective terminal command or action to resolve this (e.g. sudo systemctl restart nginx)",
  "severity": "critical | high | medium",
  "summary": "Two sentences max: what is happening and why it matters"
}`;
};

/**
 * Analyse a batch of ERROR/FATAL log messages using Gemini 2.0 Flash.
 *
 * @param {string[]} messages - raw log message strings
 * @returns {Promise<{ cause: string, fix: string, severity: string, summary: string } | null>}
 */
const analyseErrors = async (messages) => {
  const client = getClient();
  if (!client) {
    logger.warn('[AIAnalysis] GEMINI_API_KEY not set — skipping AI analysis');
    return null;
  }

  if (!messages?.length) return null;

  try {
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    // Race against a timeout so the worker is never blocked
    const responsePromise = model.generateContent(buildPrompt(messages));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), TIMEOUT_MS),
    );

    const result = await Promise.race([responsePromise, timeoutPromise]);
    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON anyway
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate expected shape
    if (!parsed.cause || !parsed.fix) {
      logger.warn('[AIAnalysis] Gemini response missing required fields');
      return null;
    }

    logger.info(`[AIAnalysis] Analysis complete — severity: ${parsed.severity}`);
    return parsed;
  } catch (err) {
    logger.error(`[AIAnalysis] Gemini call failed: ${err.message}`);
    return null; // Always degrade gracefully
  }
};

module.exports = { analyseErrors };
