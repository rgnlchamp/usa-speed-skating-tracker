const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, 'SOCQ_OWG_2026 (3).xlsx');
const outputPath = path.join(__dirname, 'men_500_dump.txt');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Men - 500';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const output = data.map((row, index) => `Row ${index}: ${JSON.stringify(row)}`).join('\n');
    fs.writeFileSync(outputPath, output);
    console.log(`Dumped ${data.length} rows to ${outputPath}`);

} catch (error) {
    console.error('Error reading Excel file:', error);
}
