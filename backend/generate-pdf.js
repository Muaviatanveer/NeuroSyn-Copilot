import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

function createPDFFile() {
  const doc = new PDFDocument({ margin: 50 });
  const outputPath = path.resolve('test_document.pdf');
  doc.pipe(fs.createWriteStream(outputPath));

  // Cover Page
  doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(26).text('NEUROSYN SYSTEM REVIEW', 50, 150);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(12).text('Enterprise Operations and Data Strategy Document', 50, 190);
  doc.moveDown(3);

  // Content Paragraph
  doc.fillColor('#374151').font('Helvetica').fontSize(11).lineGap(6).text(
    'This internal document summarizes operational strategy across various business departments. ' +
    'The goal is to evaluate current processes, identify strategic opportunities, and align core objectives ' +
    'with our latest system capabilities. Multiple data indicators across Region A, Region B, and Region C ' +
    'demonstrate shifting customer preferences towards modern AI interfaces and workspace modules.'
  );

  doc.addPage();

  // Page 2 - Specific Findings
  doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(16).text('Key Q1 Objectives', 50, 50).moveDown(1);
  doc.fillColor('#374151').font('Helvetica').fontSize(11).list([
    'Increase cloud integration efficiency by 15% across all development hubs.',
    'Optimize storage thresholds to manage high-volume customer telemetry datasets.',
    'Establish low-latency pipeline models utilizing secure local LLM networks.'
  ]);

  doc.end();
  console.log(`Successfully generated real text PDF: ${outputPath}`);
}

createPDFFile();