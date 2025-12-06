const XLSX = require('xlsx');
const path = require('path');
const store = require('./src/data/store_pdf');
const fs = require('fs');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';

async function debugWomenMassStart() {
    await store.updateData();
    const state = store.getState();

    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

    // Helper to parse Excel MS sheet
    function parseMSSheet(sheetName) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const skaters = [];
        let mode = 'points';

        for (let i = 7; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            if (typeof row[0] === 'string' && /^R\d+$/.test(row[0])) {
                mode = 'reserve';
            }

            const rank = row[0];
            const nation = row[1];
            const name = row[3];
            const points = row[4];

            if (name && (typeof rank === 'number' || (typeof rank === 'string' && rank.startsWith('R')))) {
                skaters.push({ rank, nation, name, points, mode });
            }
        }
        return skaters;
    }

    const womenOfficial = parseMSSheet('Women - MS');
    const womenApp = state.soqc['Mass Start-women'].quotas.qualified.concat(state.soqc['Mass Start-women'].quotas.reserve);

    let output = '--- Women Mass Start Comparison ---\n';
    output += 'Rank | Official Name (Pts) | App Name (Pts)\n';

    const maxLen = Math.max(womenOfficial.length, womenApp.length);
    for (let i = 0; i < 40; i++) { // Top 40
        const off = womenOfficial[i] || {};
        const app = womenApp[i] || {};

        const offStr = off.name ? `${off.rank} ${off.name} (${off.points})` : '-';
        const appStr = app.name ? `${i + 1} ${app.name} (${app.totalPoints})` : '-';

        output += `${i + 1}. ${offStr.padEnd(40)} | ${appStr}\n`;
    }
    fs.writeFileSync('debug_women_ms_output_view.js', output); // Use .js to bypass gitignore
    console.log('Output written to debug_women_ms_output_view.js');
}

debugWomenMassStart();
