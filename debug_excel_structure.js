const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'SOCQ_OWG_2026 (3).xlsx';

function inspect() {
    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));
    const sheetName = 'Men - TP';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`Sheet: ${sheetName}`);
    for (let i = 0; i < 15; i++) {
        console.log(`Row ${i}:`, JSON.stringify(data[i]));
    }
}

inspect();
