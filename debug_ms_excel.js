const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';
const SHEET_NAME = 'Men - MS';

const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));
const worksheet = workbook.Sheets[SHEET_NAME];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`Sheet: ${SHEET_NAME}`);
data.forEach((row, index) => {
    console.log(`${index}: ${JSON.stringify(row)}`);
});
