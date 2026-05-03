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

/**
 * Build the incident report prompt.
 */
const buildReportPrompt = ({ firedAt, errorCount, sampleMessages, aiCause, aiFix, aiSeverity }) => {
  const logs = (sampleMessages || [])
    .slice(0, 10)
    .map((m, i) => `[${i + 1}] ${m.slice(0, 400)}`)
    .join('\n');

  return `You are a senior SRE engineer writing a production incident post-mortem report.

INCIDENT DATA:
- Detected at: ${new Date(firedAt).toUTCString()}
- Total errors in batch: ${errorCount}
- Severity: ${aiSeverity || 'unknown'}
- Known root cause: ${aiCause || 'not yet determined'}
- Suggested fix: ${aiFix || 'not yet determined'}

SAMPLE ERROR LOGS:
${logs}

Write a complete incident post-mortem report. Respond in this exact JSON format (no markdown, no text outside JSON):
{
  "title": "Short incident title (max 10 words)",
  "severity": "critical | high | medium",
  "timeline": [
    { "time": "HH:MM UTC", "event": "what happened at this moment" }
  ],
  "rootCause": "Detailed paragraph explaining the root cause",
  "impact": "Paragraph describing what was affected and potential user impact",
  "preventionSteps": [
    "Step 1 description",
    "Step 2 description",
    "Step 3 description"
  ],
  "commands": [
    { "description": "What this command does", "command": "the actual terminal command" }
  ]
}

Rules:
- timeline must have 3-5 entries reconstructed from the data
- preventionSteps must have 3-5 actionable items
- commands must have 2-4 entries
- Be specific and technical, not generic`;
};

/**
 * Generate a full incident post-mortem report for an alert using Gemini 2.0 Flash.
 *
 * @param {object} alertData - AlertLog document fields
 * @returns {Promise<object|null>}
 */
const generateIncidentReport = async (alertData) => {
  const client = getClient();
  if (!client) {
    logger.warn('[AIAnalysis] GEMINI_API_KEY not set — cannot generate incident report');
    return null;
  }

  try {
    const model = client.getGenerativeModel({ model: MODEL_NAME });

    const responsePromise = model.generateContent(buildReportPrompt(alertData));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini request timed out')), 20_000),
    );

    const result = await Promise.race([responsePromise, timeoutPromise]);
    const text = result.response.text().trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.title || !parsed.rootCause) {
      logger.warn('[AIAnalysis] Incident report missing required fields');
      return null;
    }

    logger.info(`[AIAnalysis] Incident report generated: "${parsed.title}"`);
    return parsed;
  } catch (err) {
    logger.error(`[AIAnalysis] Incident report generation failed: ${err.message}`);
    return null;
  }
};

module.exports = { analyseErrors, generateIncidentReport };
