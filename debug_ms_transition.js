const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';
const MS_SHEET = 'Men - MS';

const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));
const msData = XLSX.utils.sheet_to_json(workbook.Sheets[MS_SHEET], { header: 1 });

for (let i = 30; i <= 35; i++) {
    console.log(`${i}: ${JSON.stringify(msData[i])}`);
}
