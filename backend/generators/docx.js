import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import fs from 'fs';
import path from 'path';
import { config } from '../utils/config.js';

/**
 * Generates a styled .docx report matching the generated executive output data.
 * @param {string} sessionId - Workflow session identifier.
 * @param {Object} reportData - Analysis outputs.
 * @returns {Promise<string>} Absolute disk path to the written .docx report.
 */
export async function generateExecutiveDOCX(sessionId, reportData) {
  const sessionOutputDir = path.join(config.paths.outputs, sessionId);
  if (!fs.existsSync(sessionOutputDir)) {
    fs.mkdirSync(sessionOutputDir, { recursive: true });
  }

  const outputPath = path.join(sessionOutputDir, `summary_report_${Date.now()}.docx`);

  const primaryHeadingColor = '1E3A8A';
  const paragraphTextColor = '374151';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'NEUROSYN-COPILOT REPORT',
            heading: HeadingLevel.TITLE,
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Execution Session Log Reference: ${sessionId}`,
                italic: true,
                size: 18,
                color: '6B7280'
              })
            ],
            spacing: { after: 360 }
          }),
          new Paragraph({
            text: '1. Executive Performance Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120, before: 240 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: reportData.executiveSummary || 'Summary metadata is currently unavailable.',
                color: paragraphTextColor,
                size: 22
              })
            ],
            spacing: { after: 240 }
          }),
          new Paragraph({
            text: '2. Proposed Strategic Operations Plan',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120, before: 240 }
          }),
          // Add table matching strategic action plans
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                tableHeader: true,
                children: [
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: 'Priority', heading: HeadingLevel.HEADING_3 })] }),
                  new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: 'Action Title', heading: HeadingLevel.HEADING_3 })] }),
                  new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ text: 'Rationale / Logic', heading: HeadingLevel.HEADING_3 })] })
                ]
              }),
              ...(reportData.actionPlan || []).map(act => (
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: act.priority })] }),
                    new TableCell({ children: [new Paragraph({ text: act.task })] }),
                    new TableCell({ children: [new Paragraph({ text: act.rationale })] })
                  ]
                })
              ))
            ]
          }),
          new Paragraph({
            text: '3. Strategic Communication Outline',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 120, before: 360 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Draft Subject Line: ', bold: true, color: primaryHeadingColor }),
              new TextRun({ text: reportData.emailSubject || '' })
            ],
            spacing: { after: 120 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Draft Communications Copy: ', bold: true, color: primaryHeadingColor })
            ],
            spacing: { after: 60 }
          }),
          ...((reportData.emailBody || '').split('\n').map(line => (
            new Paragraph({
              children: [new TextRun({ text: line, italic: true, color: paragraphTextColor, size: 20 })]
            })
          )))
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}