const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';
const filePath = path.join(__dirname, EXCEL_FILE);

console.log(`Reading file: ${filePath}`);

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);
} catch (error) {
    console.error('Error reading file:', error);
}
