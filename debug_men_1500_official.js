const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';

function dumpOfficialQualified() {
    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));
    const sheetName = 'Men - 1500';
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    let output = '--- Men 1500m Official Qualified ---\n';
    let mode = 'points';

    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const rowStr = JSON.stringify(row).toLowerCase();
        if (rowStr.includes('ranking by world cup times')) {
            mode = 'times';
            output += '\n--- Times Qualifiers ---\n';
            continue;
        }
        if (rowStr.includes('reserve list')) {
            break;
        }

        const rank = row[0];
        const name = row[3];
        const nation = row[1];

        if (name && typeof rank === 'number') {
            output += `${rank}. ${name} (${nation}) - ${mode}\n`;
        }
    }

    fs.writeFileSync('debug_men_1500_official_qualified.txt', output);
    console.log('Output written to debug_men_1500_official_qualified.txt');
}

dumpOfficialQualified();
