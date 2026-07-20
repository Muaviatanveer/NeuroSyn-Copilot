import fs from 'fs';

/**
 * Parses flat CSV files into structured rows and columns safely.
 * Calculates basic statistics for numerical fields to reduce LLM overhead.
 * @param {string} filePath - Absolute path to the CSV file.
 * @returns {Promise<Object>} Formatted spreadsheet data.
 */
export async function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== '');

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Simple CSV delimiter extraction (handles basic commas safely)
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const currentValues = parseCSVLine(lines[i]);
    const rowObj = {};
    headers.forEach((header, index) => {
      const val = currentValues[index] !== undefined ? currentValues[index] : null;
      rowObj[header] = val;
    });
    rows.push(rowObj);
  }

  // Calculate statistics for numerical data columns safely without closures errors
  const stats = {};
  headers.forEach(header => {
    const numericValues = rows
      .map(rowItem => {
        const v = rowItem[header];
        const parsed = Number(v);
        return !isNaN(parsed) && v !== null && v !== '' ? parsed : null;
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

  return {
    type: 'excel',
    sheets: [{
      sheetName: 'csv_import',
      rowCount: rows.length,
      columnsCount: headers.length,
      headers,
      rows: rows.slice(0, 500),
      stats
    }]
  };
}