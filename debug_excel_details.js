const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';
const MS_SHEET = 'Men - MS';
const TP_SHEET = 'Women - TP';

const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

console.log(`--- ${MS_SHEET} (Lines 20-45) ---`);
const msData = XLSX.utils.sheet_to_json(workbook.Sheets[MS_SHEET], { header: 1 });
for (let i = 20; i < Math.min(msData.length, 45); i++) {
    console.log(`${i}: ${JSON.stringify(msData[i])}`);
}

console.log(`\n--- ${TP_SHEET} (All) ---`);
const tpData = XLSX.utils.sheet_to_json(workbook.Sheets[TP_SHEET], { header: 1 });
tpData.forEach((row, index) => {
    console.log(`${index}: ${JSON.stringify(row)}`);
});
