import ExcelJS from 'exceljs';
import path from 'path';

async function createExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Q1_Sales_Performance');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Region', key: 'region', width: 12 },
    { header: 'Product', key: 'product', width: 22 },
    { header: 'Units_Sold', key: 'units', width: 12 },
    { header: 'Revenue', key: 'revenue', width: 15 },
    { header: 'Cost', key: 'cost', width: 15 },
    { header: 'Customer_Satisfaction', key: 'satisfaction', width: 22 }
  ];

  const data = [
    { date: '2026-01-01', region: 'Region A', product: 'Enterprise CRM', units: 120, revenue: 60000, cost: 18000, satisfaction: 4.8 },
    { date: '2026-01-02', region: 'Region B', product: 'Enterprise CRM', units: 45, revenue: 22500, cost: 11250, satisfaction: 3.2 },
    { date: '2026-01-03', region: 'Region C', product: 'Cloud Hosting', units: 310, revenue: 93000, cost: 46500, satisfaction: 4.5 },
    { date: '2026-01-04', region: 'Region A', product: 'Cloud Hosting', units: 140, revenue: 42000, cost: 21000, satisfaction: 4.7 },
    { date: '2026-01-05', region: 'Region B', product: 'Security Suite', units: 85, revenue: 51000, cost: 45900, satisfaction: 3.1 },
    { date: '2026-01-06', region: 'Region C', product: 'Security Suite', units: 200, revenue: 120000, cost: 48000, satisfaction: 4.9 },
    { date: '2026-01-07', region: 'Region A', product: 'API Gateway', units: 150, revenue: 30000, cost: 9000, satisfaction: 4.6 },
    { date: '2026-01-08', region: 'Region B', product: 'API Gateway', units: 40, revenue: 8000, cost: 3200, satisfaction: 2.9 },
    { date: '2026-01-09', region: 'Region C', product: 'AI Copilot Core', units: 500, revenue: 150000, cost: 45000, satisfaction: 4.9 },
    { date: '2026-01-10', region: 'Region A', product: 'AI Copilot Core', units: 250, revenue: 75000, cost: 22500, satisfaction: 4.8 }
  ];

  data.forEach(item => worksheet.addRow(item));

  // Style header row for a clean look
  worksheet.getRow(1).font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } };

  const outputPath = path.resolve('test_sales.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Successfully generated real Excel workbook: ${outputPath}`);
}

createExcelFile();