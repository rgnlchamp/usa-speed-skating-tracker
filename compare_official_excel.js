const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const store = require('./src/data/store_pdf');

const EXCEL_FILE = 'SOCQ_OWG_2026 (3).xlsx';

const SHEET_MAPPING = {
    'Men - 500': '500m-men',
    'Men - 1000': '1000m-men',
    'Men - 1500': '1500m-men',
    'Men - 5000': '5000m-men',
    'Men - 10000': '10000m-men',
    'Men - MS': 'Mass Start-men',
    'Women - 500': '500m-women',
    'Women - 1000': '1000m-women',
    'Women - 1500': '1500m-women',
    'Women - 3000': '3000m-women',
    'Women - 5000': '5000m-women',
    'Women - MS': 'Mass Start-women',
    'Men - TP': 'Team Pursuit-men',
    'Women - TP': 'Team Pursuit-women'
};

function normalizeName(name) {
    if (!name) return '';

    let normalized = name;

    // Remove duplicate consecutive words ("Kai Kai" → "Kai")
    normalized = normalized.replace(/\b(\w+)\s+\1\b/gi, '$1');

    // Fix spacing issues around diacritics and capitals
    normalized = normalized.replace(/([ØÖÜÄÉÈÀÓÅÆŒß])\s+([A-Z])/g, '$1$2');
    normalized = normalized.replace(/([A-Z])\s+(ß)/gi, '$1$2');

    // Normalize multiple spaces to single space
    normalized = normalized.replace(/\s+/g, ' ');

    // Standard normalization: remove accents, lowercase, keep only letters
    return normalized
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .toLowerCase()
        .replace(/[^a-z]/g, ""); // Keep only letters
}

function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

// Country mapping for Team Pursuit comparison
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

function parseExcelSheet(worksheet, sheetName) {
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const pointsQualifiers = [];
    const timesQualifiers = [];
    const reserves = [];

    let mode = 'points';
    const isTeamPursuit = sheetName.includes('TP');

    for (let i = 7; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        const rowStr = JSON.stringify(row).toLowerCase();
        if (rowStr.includes('ranking by world cup times')) {
            mode = 'times';
            continue;
        }
        if (rowStr.includes('reserve list')) {
            mode = 'reserve';
            continue;
        }

        const quotaRank = row[0]; // This is quota rank, NOT just position in list

        let name, nation;

        if (isTeamPursuit) {
            // For Team Pursuit: Name is the Nation (Col 1)
            const rawNation = row[1];
            nation = TP_COUNTRY_MAPPING[rawNation] || rawNation; // Map to code if possible
            name = nation; // Name is the country code/name
        } else {
            // Standard Events
            name = row[3];
            nation = row[1];
        }

        if (!name || typeof name !== 'string') continue;

        const skater = {
            rank: quotaRank,
            nation: nation,
            name: name,
            points: row[4],
            time: row[5]
        };

        // CRITICAL FIX: Only add if athlete has actual quota rank
        // Athletes with null/undefined quota rank are listed but didn't qualify due to NOC limits
        if (mode === 'points' && quotaRank != null && typeof quotaRank === 'number') {
            pointsQualifiers.push(skater);
        } else if (mode === 'times' && quotaRank != null && typeof quotaRank === 'number') {
            timesQualifiers.push(skater);
        } else if (mode === 'reserve' && quotaRank != null) {
            reserves.push(skater);
        }
    }
    return { pointsQualifiers, timesQualifiers, reserves };
}

function compareList(label, officialList, appList, log) {
    let discrepancies = 0;

    // Create maps for easier lookup
    const officialMap = new Map();
    officialList.forEach(s => officialMap.set(normalizeName(s.name), s));

    const appMap = new Map();
    appList.forEach(s => appMap.set(normalizeName(s.name), s));

    const matchedOfficial = new Set();
    const matchedApp = new Set();

    // 1. Exact Normalized Match
    for (const [normName, officialSkater] of officialMap) {
        if (appMap.has(normName)) {
            matchedOfficial.add(normName);
            matchedApp.add(normName);
        }
    }

    // 2. Fuzzy Match
    for (const [normOfficial, officialSkater] of officialMap) {
        if (matchedOfficial.has(normOfficial)) continue;

        let bestMatch = null;
        let minDist = Infinity;

        for (const [normApp, appSkater] of appMap) {
            if (matchedApp.has(normApp)) continue;

            // Optimization: Length difference check
            if (Math.abs(normOfficial.length - normApp.length) > 3) continue;

            const dist = levenshtein(normOfficial, normApp);
            // Allow distance up to 3 or 20% of length
            const threshold = Math.max(3, Math.floor(normOfficial.length * 0.3));

            if (dist <= threshold && dist < minDist) {
                minDist = dist;
                bestMatch = normApp;
            }
        }

        if (bestMatch) {
            const appSkater = appMap.get(bestMatch);
            log(`  [${label}] Fuzzy Match: "${officialSkater.name}" (Official) ~ "${appSkater.name}" (App) [Dist: ${minDist}]`);
            matchedOfficial.add(normOfficial);
            matchedApp.add(bestMatch);
        }
    }

    const missingInApp = officialList.filter(s => !matchedOfficial.has(normalizeName(s.name)));
    const extraInApp = appList.filter(s => !matchedApp.has(normalizeName(s.name)));

    if (missingInApp.length > 0 || extraInApp.length > 0) {
        log(`  [${label}] Discrepancies:`);
        missingInApp.forEach(s => {
            log(`    - MISSING in App: ${s.name} (${s.nation})`);
            discrepancies++;
        });
        extraInApp.forEach(s => {
            log(`    + EXTRA in App:   ${s.name}`);
            discrepancies++;
        });
    } else {
        log(`  [${label}] Match!`);
    }
    return discrepancies;
}

async function compareResults() {
    const reportPath = path.join(__dirname, 'comparison_report_v2.txt');
    let report = '';

    function log(msg) {
        console.log(msg);
        report += msg + '\n';
    }

    log('Loading App Data...');
    await store.updateData();
    const state = store.getState();
    log('App Data Loaded.');

    log(`Reading Excel: ${EXCEL_FILE}`);
    const workbook = XLSX.readFile(path.join(__dirname, EXCEL_FILE));

    let totalDiscrepancies = 0;

    for (const [sheetName, appKey] of Object.entries(SHEET_MAPPING)) {
        log(`\n========================================`);
        log(`Comparing: ${sheetName} <-> ${appKey}`);
        log(`========================================`);

        if (!workbook.Sheets[sheetName]) {
            log(`Sheet ${sheetName} not found in Excel.`);
            continue;
        }

        if (!state.soqc || !state.soqc[appKey]) {
            log(`Key ${appKey} not found in App State.`);
            continue;
        }

        const official = parseExcelSheet(workbook.Sheets[sheetName], sheetName);
        const calculated = state.soqc[appKey];

        const appPoints = calculated.quotas.qualified.filter(q => q.method === 'Points');
        const appTimes = calculated.quotas.qualified.filter(q => q.method === 'Times');
        const appReserves = calculated.quotas.reserve;

        log(`Counts (Official vs App):`);
        log(`  Points: ${official.pointsQualifiers.length} vs ${appPoints.length}`);
        log(`  Times:  ${official.timesQualifiers.length} vs ${appTimes.length}`);
        log(`  Reserve: ${official.reserves.length} vs ${appReserves.length}`);

        totalDiscrepancies += compareList('Points', official.pointsQualifiers, appPoints, log);
        totalDiscrepancies += compareList('Times', official.timesQualifiers, appTimes, log);
        totalDiscrepancies += compareList('Reserve', official.reserves, appReserves, log);
    }

    log(`\nTotal Discrepancies Found: ${totalDiscrepancies}`);
    fs.writeFileSync(reportPath, report);
    console.log(`Report saved to ${reportPath}`);
}

compareResults();
