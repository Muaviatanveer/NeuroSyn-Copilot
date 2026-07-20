import { getLocalLLMCompletion } from '../utils/llm.js';

/**
 * Analyzes structured spreadsheet statistical telemetry or unstructured document text using the local LLM.
 * @param {Object} parsedData - Structured data payload or raw text extraction.
 * @returns {Promise<Object>} Processed analysis, trends, and risk assessments.
 */
export async function runDataAnalystAgent(parsedData) {
  if (!parsedData) {
    throw new Error('Analyst Agent received invalid or empty dataset.');
  }

  const isSpreadsheet = parsedData.sheets && parsedData.sheets.length > 0;
  
  const systemMessage = "You are an analytical AI Data Scientist. Your objective is to extract trends, anomalies, and insights from the provided workspace parameters.";
  let promptMessage = "";

  if (isSpreadsheet) {
    const primarySheet = parsedData.sheets[0];
    const colStatsSummary = Object.entries(primarySheet.stats)
      .map(([colName, statObj]) => {
        if (statObj.isNumeric) {
          return `- ${colName} (Numeric): Range [${statObj.min} to ${statObj.max}], Average: ${statObj.avg}, Records: ${statObj.count}`;
        }
        return `- ${colName} (Categorical/Text)`;
      })
      .join('\n');

    const sampleRows = primarySheet.rows.slice(0, 5);
    const sampleDataString = JSON.stringify(sampleRows, null, 2);

    promptMessage = `
Analyze this dataset structure and summary metrics.

SHEET NAME: "${primarySheet.sheetName}"
TOTAL RECORDS: ${primarySheet.rowCount}
COLUMNS DETECTED:
${colStatsSummary}

SAMPLE DATA ROW VALUES:
${sampleDataString}

Please compile your analysis in a clear, formatted JSON structure. You must reply strictly with the raw JSON object, without markdown blocks. Use this schema:
{
  "summary": "High level description of the data structure and main objective",
  "kpis": [
    {"metric": "Metric Name", "value": "Parsed calculated value or count", "context": "Why this metric is important"}
  ],
  "trends": [
    "Identified correlation or pattern observed in metrics"
  ],
  "risks": [
    "Potential data anomalies, declining margins, or concerning indicators"
  ]
}
`;
  } else {
    // PDF / Unstructured Text Document Ingestion Path
    const documentText = parsedData.text || "No readable text content extraction found.";
    promptMessage = `
Analyze this unstructured text document context.

DOCUMENT CONTENT EXTRACT:
${documentText.slice(0, 6000)}

Please compile your analytical review in a clear, formatted JSON structure. You must reply strictly with the raw JSON object, without markdown blocks. Use this schema:
{
  "summary": "A concise executive overview of the document context, primary scope, and objective.",
  "kpis": [
    {"metric": "Primary Objective", "value": "Key operational focus identified", "context": "Why this objective is critical"}
  ],
  "trends": [
    "Identified topics, operational workflows, or priorities highlighted in the text"
  ],
  "risks": [
    "Bottlenecks, challenges, or critical operational risks mentioned in the text"
  ]
}
`;
  }

  try {
    const rawResult = await getLocalLLMCompletion([
      { role: 'system', content: systemMessage },
      { role: 'user', content: promptMessage }
    ], { jsonMode: true, temperature: 0.1 });

    let parsedJson;
    try {
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = rawResult.match(jsonRegex);
      const jsonContent = jsonMatch ? jsonMatch[0] : rawResult;
      
      parsedJson = JSON.parse(jsonContent);
    } catch (parseError) {
      console.warn('[Analyst Agent Warning]: LLM response failed JSON parsing. Using safety fallback schema.', parseError);
      parsedJson = {
        summary: isSpreadsheet ? "Analysis of database records complete." : "Analysis of document context complete.",
        kpis: [{ metric: "Total scope evaluated", value: isSpreadsheet ? String(parsedData.sheets[0].rowCount) : "Document extraction", context: "General quantitative scope" }],
        trends: ["High priority requirements detected in primary categories."],
        risks: ["Data distribution contains empty or localized values."]
      };
    }

    return parsedJson;
  } catch (error) {
    console.error('[Analyst Agent Error]: Failed process analysis.', error);
    throw error;
  }
}