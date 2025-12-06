const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data/pdf/3000m B Women.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON to see structure
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`Sheet Name: ${sheetName}`);
    console.log('First 10 rows:');
    console.log(JSON.stringify(data.slice(0, 10), null, 2));

} catch (error) {
    console.error('Error reading Excel file:', error);
}
