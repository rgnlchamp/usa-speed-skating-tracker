const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'SOCQ_OWG_2026 (3).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Men - 500';
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON to see the structure better
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // header: 1 gives array of arrays

    // Print first 20 rows
    data.slice(0, 20).forEach((row, index) => {
        console.log(`Row ${index}:`, JSON.stringify(row));
    });

} catch (error) {
    console.error('Error reading Excel file:', error);
}
