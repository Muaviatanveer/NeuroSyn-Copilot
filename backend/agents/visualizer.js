import { getLocalLLMCompletion } from '../utils/llm.js';

/**
 * Reviews analytical insights and schedules visual chart construction configurations.
 * Supports both spreadsheet column references and textual thematic charts.
 * @param {Object} parsedData - Root spreadsheet parameters.
 * @param {Object} analystReport - Output from Analyst agent.
 * @returns {Promise<Object>} Visual layout plot specifications.
 */
export async function runVisualizerAgent(parsedData, analystReport) {
  const isSpreadsheet = parsedData.sheets && parsedData.sheets.length > 0;
  const headers = isSpreadsheet ? parsedData.sheets[0].headers : ['Topic', 'Relevance'];

  const systemMessage = "You are an expert UX designer and dashboard visualizer. You translate datasets into clean, modern chart structure blueprints.";
  let promptMessage = "";

  if (isSpreadsheet) {
    promptMessage = `
Determine the two most relevant charts to represent this data visually.

COLUMNS DETECTED: ${headers.join(', ')}
KEY TRENDS TO REPRESENT:
${JSON.stringify(analystReport.trends)}

The local backend supports Line, Bar, and Pie chart formats. Generate a JSON payload outlining specifications for exactly two charts. Do not return markdown markers.
Use this schema:
{
  "charts": [
    {
      "chartType": "bar | line | pie",
      "title": "Clear Chart Title",
      "xAxisLabel": "Name of column to map on X-axis (from detected columns)",
      "yAxisLabel": "Name of column to map on Y-axis (from detected columns)",
      "suggestedDataPoints": [
        {"label": "Sample X Label Value", "value": 100}
      ]
    }
  ]
}
`;
  } else {
    // Unstructured text document charting path
    promptMessage = `
Define exactly two thematic or importance bar/pie charts to visually summarize this document summary analysis:

ANALYSIS SUMMARY:
${analystReport.summary}

Create a JSON payload outlining specifications for exactly two charts. Do not return markdown markers.
Use this schema:
{
  "charts": [
    {
      "chartType": "bar | pie",
      "title": "A thematic relevance chart title",
      "xAxisLabel": "Theme",
      "yAxisLabel": "Relevance Score",
      "suggestedDataPoints": [
        {"label": "Objective Alignment", "value": 90},
        {"label": "Risk Mitigation", "value": 45},
        {"label": "Operational Efficiency", "value": 75}
      ]
    }
  ]
}
`;
  }

  try {
    const rawResult = await getLocalLLMCompletion([
      { role: 'system', content: systemMessage },
      { role: 'user', content: promptMessage }
    ], { jsonMode: true, temperature: 0.2 });

    let parsedJson;
    try {
      const jsonRegex = /\{[\s\S]*\}/;
      const jsonMatch = rawResult.match(jsonRegex);
      const jsonContent = jsonMatch ? jsonMatch[0] : rawResult;
      
      parsedJson = JSON.parse(jsonContent);
    } catch (parseError) {
      console.warn('[Visualizer Agent Warning]: LLM failed JSON formatting.', parseError);
      
      // Safe fallback data structures
      parsedJson = {
        charts: [
          {
            chartType: "bar",
            title: "Operational Metric Relevance",
            xAxisLabel: "Thematic Category",
            yAxisLabel: "Relevance Score",
            suggestedDataPoints: [
              { label: "Objective Strategy", value: 85 },
              { label: "Process Ingestion", value: 60 },
              { label: "Resource Analytics", value: 45 }
            ]
          }
        ]
      };
    }

    return parsedJson;
  } catch (error) {
    console.error('[Visualizer Agent Error]: Graphic planning failed.', error);
    throw error;
  }
}