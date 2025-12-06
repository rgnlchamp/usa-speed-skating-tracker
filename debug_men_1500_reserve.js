const XLSX = require('xlsx');
const path = require('path');
const store = require('./src/data/store_pdf');
const fs = require('fs');

const EXCEL_FILE = 'data/pdf/SOQC_OWG_2026 (4.1).xlsx';

async function debugMen1500() {
    await store.updateData();
    const state = store.getState();

    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

    // Helper to parse Excel sheet
    function parseSheet(sheetName) {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const reserves = [];
        let mode = 'points';

        for (let i = 7; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;

            if (typeof row[0] === 'string' && /^R\d+$/.test(row[0])) {
                mode = 'reserve';
            }

            if (mode === 'reserve') {
                const rank = row[0];
                const nation = row[1];
                const name = row[3];
                const points = row[4];

                if (name) {
                    reserves.push({ rank, nation, name, points });
                }
            }
        }
        return reserves;
    }

    const officialReserves = parseSheet('Men - 1500');
    const appReserves = state.soqc['1500m-men'].quotas.reserve;

    let output = '--- Men 1500m Reserve Comparison ---\n';
    output += 'Rank | Official Name (Pts) | App Name (Pts)\n';

    const maxLen = Math.max(officialReserves.length, appReserves.length);
    for (let i = 0; i < maxLen; i++) {
        const off = officialReserves[i] || {};
        const app = appReserves[i] || {};

        const offStr = off.name ? `${off.rank} ${off.name} (${off.points})` : '-';
        const appStr = app.name ? `${i + 1} ${app.name} (${app.points})` : '-';

        output += `${i + 1}. ${offStr.padEnd(40)} | ${appStr}\n`;
    }

    fs.writeFileSync('debug_men_1500_reserve.txt', output);
    console.log('Output written to debug_men_1500_reserve.txt');
}

debugMen1500();
