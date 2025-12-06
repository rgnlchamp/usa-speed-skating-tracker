const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'SOCQ_OWG_2026 (3).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = 'Men - 500';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log(`Total rows: ${data.length}`);

    // Find rows with specific keywords
    data.forEach((row, index) => {
        const rowStr = JSON.stringify(row);
        if (rowStr.includes('Rank') || rowStr.includes('Name') || rowStr.includes('Nation') || rowStr.includes('Time') || rowStr.includes('Points')) {
            console.log(`Header candidate at row ${index}:`, rowStr);
        }
        if (rowStr.includes('Ranking by Time') || rowStr.includes('Ranking by World Cup points')) {
            console.log(`Section header at row ${index}:`, rowStr);
        }
    });

} catch (error) {
    console.error('Error reading Excel file:', error);
}
