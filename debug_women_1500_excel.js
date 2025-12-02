const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'SOCQ_OWG_2026 (3).xlsx';
const SHEET_NAME = 'Women - 1500';

function dumpSheet() {
    const workbook = XLSX.readFile(EXCEL_FILE);
    const worksheet = workbook.Sheets[SHEET_NAME];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let output = `--- ${SHEET_NAME} ---\n`;
    data.forEach((row, index) => {
        if (index < 7) return; // Skip header
        output += JSON.stringify(row) + '\n';
    });

    fs.writeFileSync('dump_women_1500_excel.md', output);
    console.log('Dump saved to dump_women_1500_excel.md');
}

dumpSheet();
