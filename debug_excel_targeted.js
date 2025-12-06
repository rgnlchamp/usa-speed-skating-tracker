const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';
const MS_SHEET = 'Men - MS';
const TP_SHEET = 'Women - TP';

const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

// 1. Find Reserve Header in Men - MS
const msData = XLSX.utils.sheet_to_json(workbook.Sheets[MS_SHEET], { header: 1 });
let reserveIndex = -1;
for (let i = 0; i < msData.length; i++) {
    const rowStr = JSON.stringify(msData[i] || []).toLowerCase();
    if (rowStr.includes('reserve')) {
        reserveIndex = i;
        console.log(`Found 'Reserve' at index ${i}: ${JSON.stringify(msData[i])}`);
    }
}

if (reserveIndex !== -1) {
    console.log('Surrounding rows:');
    for (let i = reserveIndex - 2; i <= reserveIndex + 2; i++) {
        console.log(`${i}: ${JSON.stringify(msData[i])}`);
    }
} else {
    console.log('Could not find "Reserve" in Men - MS');
}

// 2. Check CHN and KAZ in Women - TP
const tpData = XLSX.utils.sheet_to_json(workbook.Sheets[TP_SHEET], { header: 1 });
console.log('\n--- Women - TP (CHN/KAZ) ---');
tpData.forEach((row, index) => {
    const rowStr = JSON.stringify(row);
    if (rowStr.includes('CHN') || rowStr.includes('China') || rowStr.includes('KAZ') || rowStr.includes('Kazakhstan')) {
        console.log(`${index}: ${JSON.stringify(row)}`);
    }
});
