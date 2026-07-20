import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// -------------------------------------------------------------
// HIGH-FIDELITY BUSINESS TELEMETRY DATASET
// -------------------------------------------------------------
const dataset = [
  { date: '2026-01-01', region: 'Region A', product: 'Enterprise CRM', units: 120, revenue: 60000, cost: 18000, satisfaction: 4.8 },
  { date: '2026-01-02', region: 'Region B', product: 'Enterprise CRM', units: 45, revenue: 22500, cost: 11250, satisfaction: 3.2 }, // Low satisfaction indicator
  { date: '2026-01-03', region: 'Region C', product: 'Cloud Hosting', units: 310, revenue: 93000, cost: 46500, satisfaction: 4.5 },
  { date: '2026-01-04', region: 'Region A', product: 'Cloud Hosting', units: 140, revenue: 42000, cost: 21000, satisfaction: 4.7 },
  { date: '2026-01-05', region: 'Region B', product: 'Security Suite', units: 85, revenue: 51000, cost: 45900, satisfaction: 3.1 },  // Severe Cost Bottleneck (90% Cost ratio)
  { date: '2026-01-06', region: 'Region C', product: 'Security Suite', units: 200, revenue: 120000, cost: 48000, satisfaction: 4.9 },
  { date: '2026-01-07', region: 'Region A', product: 'API Gateway', units: 150, revenue: 30000, cost: 9000, satisfaction: 4.6 },
  { date: '2026-01-08', region: 'Region B', product: 'API Gateway', units: 40, revenue: 8000, cost: 3200, satisfaction: 2.9 },   // Low volume & low satisfaction
  { date: '2026-01-09', region: 'Region C', product: 'AI Copilot Core', units: 500, revenue: 150000, cost: 45000, satisfaction: 4.9 }, // Top Performer
  { date: '2026-01-10', region: 'Region A', product: 'AI Copilot Core', units: 250, revenue: 75000, cost: 22500, satisfaction: 4.8 }
];

// 1. GENERATE test_sales.csv
function generateCSV() {
  const outputPath = path.resolve('test_sales.csv');
  const headers = ['Date', 'Region', 'Product', 'Units_Sold', 'Revenue', 'Cost', 'Customer_Satisfaction'];
  
  const csvLines = [headers.join(',')];
  dataset.forEach(row => {
    const line = [
      row.date,
      row.region,
      `"${row.product}"`, // Quote strings with spaces
      row.units,
      row.revenue,
      row.cost,
      row.satisfaction
    ].join(',');
    csvLines.push(line);
  });

  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf8');
  console.log(`✓ Generated CSV Spreadsheet: ${outputPath}`);
}

// 2. GENERATE test_sales.xlsx
async function generateExcel() {
  const outputPath = path.resolve('test_sales.xlsx');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Q1_SaaS_Performance');

  // Define column mappings
  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Region', key: 'region', width: 12 },
    { header: 'Product', key: 'product', width: 22 },
    { header: 'Units_Sold', key: 'units', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 15 },
    { header: 'Cost', key: 'cost', width: 15 },
    { header: 'Customer_Satisfaction', key: 'satisfaction', width: 22 }
  ];

  // Append records
  dataset.forEach(row => worksheet.addRow(row));

  // Style Header Row (Corporate Dark Blue Theme)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '121214' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };

  await workbook.xlsx.writeFile(outputPath);
  console.log(`✓ Generated Excel Workbook: ${outputPath}`);
}

// 3. GENERATE test_document.pdf
function generatePDF() {
  const outputPath = path.resolve('test_document.pdf');
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
  doc.pipe(fs.createWriteStream(outputPath));

  // Cover Page Banner
  doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(26).text('NEUROSYN SYSTEM REVIEW', 50, 150);
  doc.fillColor('#4B5563').font('Helvetica').fontSize(12).text('Enterprise Operations and Data Strategy Document', 50, 190);
  doc.moveDown(3);

  // Content Paragraph
  doc.fillColor('#374151').font('Helvetica').fontSize(11).lineGap(6).text(
    'This internal document summarizes operational strategy across various business departments. ' +
    'The goal is to evaluate current processes, identify strategic opportunities, and align core objectives ' +
    'with our latest system capabilities. Multiple data indicators across Region A, Region B, and Region C ' +
    'demonstrate shifting customer preferences towards modern AI interfaces and unified workspace modules.'
  );

  doc.addPage();

  // Page 2 - Specific Objectives
  doc.fillColor('#1E3A8A').font('Helvetica-Bold').fontSize(16).text('Key Q1 Objectives', 50, 50).moveDown(1);
  doc.fillColor('#374151').font('Helvetica').fontSize(11).list([
    'Increase cloud integration efficiency by 15% across all development hubs.',
    'Optimize storage thresholds to manage high-volume customer telemetry datasets.',
    'Establish low-latency pipeline models utilizing secure local LLM networks.'
  ]);

  doc.end();
  console.log(`✓ Generated Document PDF: ${outputPath}`);
}

// -------------------------------------------------------------
// EXECUTE ALL GENERATORS
// -------------------------------------------------------------
async function run() {
  try {
    generateCSV();
    await generateExcel();
    generatePDF();
    console.log('\n🌟 All three test files compiled successfully. Ready for ingestion.');
  } catch (err) {
    console.error('Failed to compile test data files:', err);
  }
}

run();