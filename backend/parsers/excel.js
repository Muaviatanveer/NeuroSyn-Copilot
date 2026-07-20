import ExcelJS from 'exceljs';
import fs from 'fs';

/**
 * Parses an Excel file (.xlsx) and extracts metadata, structures, and row content safely.
 * @param {string} filePath - Path to the Excel file.
 * @returns {Promise<Object>} Structured spreadsheet data.
 */
export async function parseExcel(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const sheetsData = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name;
    const rows = [];
    let headers = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const rowValues = [];
      
      // Iterate cells to capture rich text and formula calculations safely
      row.eachCell({ includeEmpty: true }, (cell) => {
        let val = cell.value;
        if (val && typeof val === 'object' && 'result' in val) {
          val = val.result; // Extract calculation results
        }
        if (val && typeof val === 'object' && 'richText' in val) {
          val = val.richText.map(t => t.text).join(''); // Concatenate stylized text
        }
        rowValues.push(val);
      });

      if (rowNumber === 1) {
        // Sanitize headers to be safe keys
        headers = rowValues.map((v, i) => {
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            return String(v).trim();
          }
          return `Col_${i + 1}`;
        });
      } else if (headers.length > 0) {
        const rowData = {};
        headers.forEach((header, index) => {
          const val = rowValues[index];
          rowData[header] = val !== undefined ? val : null;
        });
        rows.push(rowData);
      }
    });

    // Compute stats for numerical columns to reduce LLM tokens usage
    const stats = {};
    headers.forEach(header => {
      const numericValues = rows
        .map(r => {
          const val = r[header];
          if (val instanceof Date) return val.getTime();
          const parsed = Number(val);
          return !isNaN(parsed) && val !== null && val !== '' ? parsed : null;
        })
        .filter(val => val !== null);

      if (numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        stats[header] = {
          isNumeric: true,
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: Number((sum / numericValues.length).toFixed(2)),
          count: numericValues.length
        };
      } else {
        stats[header] = { isNumeric: false };
      }
    });

    sheetsData.push({
      sheetName,
      rowCount: rows.length,
      columnsCount: headers.length,
      headers,
      rows: rows.slice(0, 500),
      stats
    });
  });

  return {
    type: 'excel',
    sheets: sheetsData
  };
}