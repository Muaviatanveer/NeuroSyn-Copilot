import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { config } from '../utils/config.js';

/**
 * Builds a styled Executive PDF summary containing text blocks and embedded trends charts.
 * @param {string} sessionId - Workflow session identifier.
 * @param {Object} reportData - Structure containing Analyst summary and Writer copy.
 * @param {Array<string>} chartImages - Absolute disk paths to rendered chart images.
 * @returns {Promise<string>} Absolute disk path to the written PDF document.
 */
export async function generateExecutivePDF(sessionId, reportData, chartImages) {
  return new Promise((resolve, reject) => {
    const sessionOutputDir = path.join(config.paths.outputs, sessionId);
    if (!fs.existsSync(sessionOutputDir)) {
      fs.mkdirSync(sessionOutputDir, { recursive: true });
    }

    const outputPath = path.join(sessionOutputDir, `executive_report_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 54, size: 'LETTER' });
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    // Color Theme Scheme
    const primaryColor = '#1E3A8A';
    const textColor = '#374151';
    const subtleBg = '#F3F4F6';

    // 1. Header/Banner
    doc.rect(0, 0, 612, 120).fill(primaryColor);
    doc.fillColor('#FFFFFF')
       .font('Helvetica-Bold')
       .fontSize(24)
       .text('NEUROSYN-COPILOT', 54, 35)
       .fontSize(12)
       .font('Helvetica')
       .text('Autonomous Workspace Executive Analytics Report', 54, 65);

    // Date & Session info
    doc.fillColor('#93C5FD')
       .fontSize(9)
       .text(`Session ID: ${sessionId}  |  Generated: ${new Date().toLocaleDateString()}`, 54, 85);

    doc.y = 150; // Move drawing head down below header banner

    // 2. Executive Summary Block
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(16)
       .text('Executive Summary', 54, doc.y)
       .moveDown(0.5);

    doc.fillColor(textColor)
       .font('Helvetica')
       .fontSize(11)
       .lineGap(4)
       .text(reportData.executiveSummary || 'No summary provided.')
       .moveDown(1.5);

    // 3. Recommended Initiatives Block
    doc.fillColor(primaryColor)
       .font('Helvetica-Bold')
       .fontSize(14)
       .text('Operational Plan & Actions', 54, doc.y)
       .moveDown(0.5);

    const actions = reportData.actionPlan || [];
    actions.forEach((act, idx) => {
      const currentY = doc.y;
      doc.rect(54, currentY, 504, 45).fill(subtleBg);
      
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10)
         .text(`${idx + 1}. [${act.priority} Priority] ${act.task}`, 64, currentY + 8);

      doc.fillColor(textColor)
         .font('Helvetica')
         .fontSize(9)
         .text(act.rationale, 64, currentY + 22);

      doc.y = currentY + 55; // Set vertical cursor for next step
    });

    // 4. Dynamic Chart Embedding
    if (chartImages && chartImages.length > 0) {
      doc.addPage();
      
      doc.rect(0, 0, 612, 50).fill(primaryColor);
      doc.fillColor('#FFFFFF')
         .font('Helvetica-Bold')
         .fontSize(14)
         .text('Analytical Visualizations', 54, 18);

      doc.y = 80;

      chartImages.forEach((img, idx) => {
        if (fs.existsSync(img)) {
          if (idx > 0) doc.moveDown(1.5);
          doc.image(img, {
            fit: [504, 250],
            align: 'center'
          });
          doc.y += 260; // Offset spacing for graphics layout
        }
      });
    }

    doc.end();

    writeStream.on('finish', () => resolve(outputPath));
    writeStream.on('error', (err) => reject(err));
  });
}