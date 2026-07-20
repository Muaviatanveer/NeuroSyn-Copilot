import pptxgen from 'pptxgenjs';
import fs from 'fs';
import path from 'path';
import { config } from '../utils/config.js';

/**
 * Builds an editable PowerPoint presentation deck from processed metrics and graphics.
 * @param {string} sessionId - Workflow session identifier.
 * @param {Object} reportData - Executive text outputs.
 * @param {Array<string>} chartImages - Absolute disk paths to rendered chart images.
 * @returns {Promise<string>} Absolute disk path to the written .pptx file.
 */
export async function generatePresentationPPT(sessionId, reportData, chartImages) {
  const sessionOutputDir = path.join(config.paths.outputs, sessionId);
  if (!fs.existsSync(sessionOutputDir)) {
    fs.mkdirSync(sessionOutputDir, { recursive: true });
  }

  const outputPath = path.join(sessionOutputDir, `presentation_${Date.now()}.pptx`);
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';

  // Master Slide Styling Configuration
  const brandDark = '1E3A8A';
  const textGray = '374151';
  const lightBg = 'F3F4F6';

  // 1. Title Slide (Dark Background Accent)
  const slide1 = pptx.addSlide();
  slide1.background = { fill: brandDark };
  slide1.addText('NEUROSYN-COPILOT', {
    x: 1.0, y: 1.8, w: '80%', h: 0.8,
    fontSize: 40, bold: true, color: 'FFFFFF', fontFace: 'Arial'
  });
  slide1.addText('Autonomous Executive Business Strategy Review', {
    x: 1.0, y: 2.7, w: '80%', h: 0.5,
    fontSize: 18, color: '93C5FD', fontFace: 'Arial'
  });
  slide1.addText(`Run ID: ${sessionId}`, {
    x: 1.0, y: 4.5, w: '80%', h: 0.4,
    fontSize: 11, color: 'FFFFFF', italic: true
  });

  // 2. Executive Insights Summary Slide
  const slide2 = pptx.addSlide();
  slide2.addText('Executive Analysis Overview', {
    x: 0.6, y: 0.4, w: '80%', h: 0.5,
    fontSize: 24, bold: true, color: brandDark, fontFace: 'Arial'
  });
  slide2.addText(reportData.executiveSummary || '', {
    x: 0.6, y: 1.2, w: '88%', h: 3.5,
    fontSize: 14, color: textGray, lineSpacing: 22, fontFace: 'Arial', valign: 'top'
  });

  // 3. Operational Action Matrix Slide
  const slide3 = pptx.addSlide();
  slide3.addText('Recommended Initiatives & Matrix', {
    x: 0.6, y: 0.4, w: '80%', h: 0.5,
    fontSize: 24, bold: true, color: brandDark, fontFace: 'Arial'
  });

  const actions = reportData.actionPlan || [];
  const rows = [['Priority', 'Initiative Task', 'Rationale / Logic']];
  actions.slice(0, 3).forEach(act => {
    rows.push([act.priority, act.task, act.rationale]);
  });

  slide3.addTable(rows, {
    x: 0.6, y: 1.2, w: '88%', h: 3.2,
    border: { pt: 1, color: 'D1D5DB' },
    fill: lightBg,
    fontSize: 11,
    fontFace: 'Arial',
    color: textGray,
    valign: 'middle',
    align: 'left'
  });

  // 4. Analytical Charts Slide
  if (chartImages && chartImages.length > 0) {
    chartImages.forEach((img, idx) => {
      if (fs.existsSync(img)) {
        const slide = pptx.addSlide();
        slide.addText(`Performance Visualization - Section ${idx + 1}`, {
          x: 0.6, y: 0.4, w: '80%', h: 0.5,
          fontSize: 24, bold: true, color: brandDark, fontFace: 'Arial'
        });
        slide.addImage({
          path: img,
          x: 1.6, y: 1.1, w: 6.8, h: 3.8
        });
      }
    });
  }

  await pptx.writeFile({ fileName: outputPath });
  return outputPath;
}