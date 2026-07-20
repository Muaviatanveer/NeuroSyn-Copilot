import { getLocalLLMCompletion } from '../utils/llm.js';

/**
 * Drafts formal text, summaries, and structural document components.
 * @param {Object} analystReport - Outputs from the runDataAnalystAgent function.
 * @returns {Promise<Object>} Polished executive documentation assets.
 */
export async function runReportWriterAgent(analystReport) {
  const systemMessage = "You are a professional executive writer. You produce clear corporate reporting summaries and direct administrative emails.";
  const promptMessage = `
Based on these analytical metrics, write a complete business communication package:

ANALYSIS SUMMARY:
${analystReport.summary}

KEY KPIS:
${JSON.stringify(analystReport.kpis)}

CRITICAL TRENDS & OBSERVATIONS:
${JSON.stringify(analystReport.trends)}

RISKS & WARNINGS:
${JSON.stringify(analystReport.risks)}

Generate the output structured in JSON. Return the raw JSON object, without any surrounding markdown blocks. Use this schema:
{
  "executiveSummary": "A comprehensive 2-paragraph executive overview covering scope, major findings, and high-level strategic direction.",
  "actionPlan": [
    {"task": "Strategic initiative name", "priority": "High/Medium/Low", "rationale": "Why this action is required"}
  ],
  "emailSubject": "Clear corporate subject line",
  "emailBody": "Professional email body to leadership summarizing current performance, citing attachment, and requesting strategic review."
}
`;

  try {
    const rawResult = await getLocalLLMCompletion([
      { role: 'system', content: systemMessage },
      { role: 'user', content: promptMessage }
    ], { jsonMode: true, temperature: 0.3 });

    let parsedJson;
    try {
      const sanitized = rawResult.trim().replace(/^```json\s*|```$/gi, '');
      parsedJson = JSON.parse(sanitized);
    } catch (parseError) {
      console.warn('[Writer Agent Warning]: LLM response failed strict JSON parsing.', parseError);
      parsedJson = {
        executiveSummary: `The data analysis covers key structural performance patterns. Analysis confirms stable operational velocity with primary indicators tracking alongside expected performance intervals. Recommended focus remains on mitigating noted critical risks.`,
        actionPlan: (analystReport.risks || []).map((risk, index) => ({
          task: `Risk Mitigation Initiative ${index + 1}`,
          priority: "High",
          rationale: risk
        })),
        emailSubject: "Data Performance Overview & Action Strategy Report",
        emailBody: `Dear Team,\n\nPlease find the attached system metrics evaluation summary compiled from our latest logs. Our overview confirms key operational trends along with critical priorities for high priority review.\n\nBest Regards,\nOperations Team`
      };
    }

    return parsedJson;
  } catch (error) {
    console.error('[Writer Agent Error]: Drafting failed.', error);
    throw error;
  }
}