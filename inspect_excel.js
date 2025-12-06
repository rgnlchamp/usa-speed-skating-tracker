const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'SOCQ_OWG_2026 (3).xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Sheet: ${sheetName} ---`);
        const worksheet = workbook.Sheets[sheetName];
        // Get the range of the sheet
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // Print the first 10 rows
        for (let R = range.s.r; R <= Math.min(range.e.r, 10); ++R) {
            let row = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = { c: C, r: R };
                const cellRef = XLSX.utils.encode_cell(cellAddress);
                const cell = worksheet[cellRef];
                row.push(cell ? cell.v : '');
            }
            console.log(row.join('\t'));
        }
    });

} catch (error) {
    console.error('Error reading Excel file:', error);
}
