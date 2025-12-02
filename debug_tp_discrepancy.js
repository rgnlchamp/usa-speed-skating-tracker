const XLSX = require('xlsx');
const path = require('path');
const store = require('./src/data/store_pdf');

const EXCEL_FILE = 'SOCQ_OWG_2026 (3).xlsx';

const TP_MAPPING = {
    'Men - TP': 'Team Pursuit-men',
    'Women - TP': 'Team Pursuit-women'
};

const TP_COUNTRY_MAPPING = {
    'United States of America': 'USA',
    'Netherlands': 'NED',
    'Canada': 'CAN',
    'Japan': 'JPN',
    'Republic of Korea': 'KOR',
    'Korea': 'KOR',
    "People's Republic of China": 'CHN',
    'China': 'CHN',
    'Norway': 'NOR',
    'Germany': 'GER',
    'Poland': 'POL',
    'Italy': 'ITA',
    'Kazakhstan': 'KAZ',
    'Belgium': 'BEL',
    'Estonia': 'EST',
    'Austria': 'AUT',
    'Czechia': 'CZE',
    'Czech Republic': 'CZE',
    'Spain': 'ESP',
    'Great Britain': 'GBR',
    'Hungary': 'HUN',
    'Switzerland': 'SUI',
    'Sweden': 'SWE',
    'Denmark': 'DEN',
    'Finland': 'FIN',
    'France': 'FRA',
    'Romania': 'ROU',
    'Chinese Taipei': 'TPE',
    'New Zealand': 'NZL'
};

function parseExcelSheet(worksheet) {
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const qualifiers = [];
    const reserves = [];
    let mode = 'qualifiers';

    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const rowStr = JSON.stringify(row).toLowerCase();
        if (rowStr.includes('reserve list')) {
            mode = 'reserve';
            continue;
        }

        const quotaRank = row[0];
        const rawNation = row[1];

        if (!rawNation) continue;

        const nation = TP_COUNTRY_MAPPING[rawNation] || rawNation;

        // Only include if it has a rank (meaning it qualified or is a valid reserve)
        if (quotaRank != null) {
            // TP columns: Points=2, Time=3
            const item = { rank: quotaRank, nation: nation, points: row[2], time: row[3] };
            if (mode === 'qualifiers') qualifiers.push(item);
            else reserves.push(item);
        }
    }
    return { qualifiers, reserves };
}

async function inspect() {
    console.log('Loading App Data...');
    await store.updateData();
    const state = store.getState();

    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

    for (const [sheetName, appKey] of Object.entries(TP_MAPPING)) {
        console.log(`\n=== ${sheetName} ===`);

        const official = parseExcelSheet(workbook.Sheets[sheetName]);
        const appData = state.soqc[appKey];

        if (!appData) {
            console.log(`MISSING APP DATA FOR ${appKey}`);
            continue;
        }

        const appQualifiers = appData.quotas.qualified;
        const appReserves = appData.quotas.reserve;

        console.log('\n--- QUALIFIERS ---');
        console.log('OFFICIAL (Excel)'.padEnd(30) + ' | ' + 'APP (Calculated)');
        console.log('-'.repeat(60));

        const maxQ = Math.max(official.qualifiers.length, appQualifiers.length);
        if (appQualifiers.length > 0) {
            console.log('Sample App Qualifier:', JSON.stringify(appQualifiers[0], null, 2));
        }
        for (let i = 0; i < maxQ; i++) {
            const off = official.qualifiers[i];
            const app = appQualifiers[i];

            const offStr = off ? `${off.rank}. ${off.nation} (${off.points}pts)` : '';
            const appPoints = app ? (app.totalPoints !== undefined ? app.totalPoints : app.points) : '?';
            const appStr = app ? `${app.rank || '?'}. ${app.name} (${appPoints}pts)` : '';

            const match = off && app && off.nation === app.name;
            const mark = match ? ' ' : 'X';

            console.log(`${mark} ${offStr.padEnd(28)} | ${appStr}`);
        }

        console.log('\n--- RESERVES ---');
        const maxR = Math.max(official.reserves.length, appReserves.length);
        for (let i = 0; i < maxR; i++) {
            const off = official.reserves[i];
            const app = appReserves[i];

            const offStr = off ? `${off.rank}. ${off.nation}` : '';
            const appStr = app ? `${app.rank}. ${app.name}` : '';

            const match = off && app && off.nation === app.name;
            const mark = match ? ' ' : 'X';

            console.log(`${mark} ${offStr.padEnd(28)} | ${appStr}`);
        }
    }
}

inspect();
