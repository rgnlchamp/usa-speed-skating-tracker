const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';

function dumpOfficialTP() {
    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));
    const sheetName = 'Women - TP';
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    let output = '--- Women Team Pursuit Official ---\n';
    const mode = 'Official';

    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const rank = row[0];
        const nation = row[1];
        const points = row[2]; // Col 2 is Points
        const time = row[3];   // Col 3 is Time

        if (nation && (nation.includes('China') || nation.includes('Kazakhstan') || nation === 'CHN' || nation === 'KAZ')) {
            output += `${rank}. ${nation} (Pts: ${points}, Time: ${time}) - ${mode}\n`;
        }
    }

    fs.writeFileSync('debug_tp_women_official.txt', output);
    console.log('Output written to debug_tp_women_official.txt');
}

dumpOfficialTP();
