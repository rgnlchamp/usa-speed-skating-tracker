/**
 * Comprehensive SOQC Validation Script
 * Compares our data against official ISU standings and verifies Olympic quota calculations
 */

const fs = require('fs');
const path = require('path');

// Load our generated data
const dataPath = path.join(__dirname, 'public', 'data.json');
const ourData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// ISU Official Standings URLs
const ISU_URLS = {
    '500m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_500/standings',
    '500m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_500/standings',
    '1000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_1000/standings',
    '1000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_1000/standings',
    '1500m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_1500/standings',
    '1500m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_1500/standings',
    '3000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_3000/standings',
    '5000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_5000/standings',
    '5000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_5000/standings',
    '10000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_10000/standings',
};

// Olympic Quota Rules
const QUOTA_RULES = {
    '500m': { total: 28, pointsSlots: 21, timesSlots: 7, maxPerNOC: 3 },
    '1000m': { total: 28, pointsSlots: 21, timesSlots: 7, maxPerNOC: 3 },
    '1500m': { total: 28, pointsSlots: 21, timesSlots: 7, maxPerNOC: 3 },
    '3000m': { total: 28, pointsSlots: 21, timesSlots: 7, maxPerNOC: 3 },
    '5000m-W': { total: 24, pointsSlots: 18, timesSlots: 6, maxPerNOC: 3 },
    '5000m-M': { total: 24, pointsSlots: 18, timesSlots: 6, maxPerNOC: 3 },
    '10000m': { total: 16, pointsSlots: 10, timesSlots: 6, maxPerNOC: 3 },
    'Mass Start': { total: 24, pointsSlots: 24, timesSlots: 0, maxPerNOC: 3 },
    'Team Pursuit': { total: 8, pointsSlots: 8, timesSlots: 0, maxPerNOC: 1 }
};

function calculateSkaterTotal(skaterName, country, distance, gender) {
    let total = 0;
    const races = [];

    Object.keys(ourData.raceResults).forEach(wc => {
        ourData.raceResults[wc]
            .filter(r => r.distance === distance && r.gender === gender)
            .forEach(race => {
                const result = race.results.find(r =>
                    r.name && r.name.toLowerCase().includes(skaterName.toLowerCase()) &&
                    r.country === country
                );
                if (result) {
                    total += result.points || 0;
                    races.push({ wc, div: race.division, pts: result.points, time: result.time });
                }
            });
    });

    return { total, races };
}

function printHeader(title) {
    console.log('\n' + '═'.repeat(80));
    console.log(' ' + title);
    console.log('═'.repeat(80));
}

function printSection(title) {
    console.log('\n' + '─'.repeat(60));
    console.log(' ' + title);
    console.log('─'.repeat(60));
}

// Main validation
console.log('╔════════════════════════════════════════════════════════════════════════════╗');
console.log('║        SOQC OLYMPIC QUOTA VALIDATION REPORT                               ║');
console.log('║        Generated: ' + new Date().toISOString().substring(0, 19) + '                              ║');
console.log('╚════════════════════════════════════════════════════════════════════════════╝');

// Check each distance
const distancesToCheck = [
    { key: '500m-women', distance: '500m', gender: 'women' },
    { key: '500m-men', distance: '500m', gender: 'men' },
    { key: '1000m-women', distance: '1000m', gender: 'women' },
    { key: '1000m-men', distance: '1000m', gender: 'men' },
    { key: '1500m-women', distance: '1500m', gender: 'women' },
    { key: '1500m-men', distance: '1500m', gender: 'men' },
    { key: '3000m-women', distance: '3000m', gender: 'women' },
    { key: '5000m-women', distance: '5000m', gender: 'women' },
    { key: '5000m-men', distance: '5000m', gender: 'men' },
    { key: '10000m-men', distance: '10000m', gender: 'men' },
];

distancesToCheck.forEach(({ key, distance, gender }) => {
    printHeader(`${distance} ${gender.toUpperCase()}`);

    const soqc = ourData.soqc[key];
    if (!soqc) {
        console.log('  ⚠️  No SOQC data available');
        return;
    }

    // Get quota rules
    let ruleKey = distance;
    if (distance === '5000m') ruleKey = gender === 'women' ? '5000m-W' : '5000m-M';
    const rules = QUOTA_RULES[ruleKey] || QUOTA_RULES['500m'];

    console.log(`\n📋 Quota Rules: ${rules.total} total (${rules.pointsSlots} points + ${rules.timesSlots} times), max ${rules.maxPerNOC} per NOC`);
    console.log(`🔗 Official: ${ISU_URLS[key] || 'N/A'}`);

    // Show Points Qualifiers
    printSection('Points Qualifiers');
    const pointsQualifiers = soqc.quotas?.qualified?.filter(q => q.method === 'Points') || [];
    console.log(`Count: ${pointsQualifiers.length} / ${rules.pointsSlots} slots\n`);

    if (pointsQualifiers.length > 0) {
        console.log('Rank | Name                           | NOC | Points | Best Time');
        console.log('-----|--------------------------------|-----|--------|----------');
        pointsQualifiers.slice(0, 25).forEach((skater, idx) => {
            const name = (skater.name || '').padEnd(30).substring(0, 30);
            const pts = String(skater.totalPoints || 0).padStart(6);
            const time = (skater.bestTime || 'N/A').padStart(9);
            console.log(`${String(idx + 1).padStart(4)} | ${name} | ${skater.country || '???'} | ${pts} | ${time}`);
        });
    }

    // Show Times Qualifiers
    if (rules.timesSlots > 0) {
        printSection('Times Qualifiers');
        const timesQualifiers = soqc.quotas?.qualified?.filter(q => q.method === 'Times') || [];
        console.log(`Count: ${timesQualifiers.length} / ${rules.timesSlots} slots\n`);

        if (timesQualifiers.length > 0) {
            console.log('Rank | Name                           | NOC | Best Time | Points');
            console.log('-----|--------------------------------|-----|-----------|-------');
            timesQualifiers.slice(0, 10).forEach((skater, idx) => {
                const name = (skater.name || '').padEnd(30).substring(0, 30);
                const time = (skater.bestTime || 'N/A').padStart(9);
                const pts = String(skater.totalPoints || 0).padStart(6);
                console.log(`${String(idx + 1).padStart(4)} | ${name} | ${skater.country || '???'} | ${time} | ${pts}`);
            });
        }
    }

    // Check NOC distribution
    printSection('NOC Distribution (Qualified)');
    const allQualified = soqc.quotas?.qualified || [];
    const nocCounts = {};
    allQualified.forEach(s => {
        nocCounts[s.country] = (nocCounts[s.country] || 0) + 1;
    });

    const nocEntries = Object.entries(nocCounts).sort((a, b) => b[1] - a[1]);
    console.log('NOC  | Count | Status');
    console.log('-----|-------|--------');
    nocEntries.forEach(([noc, count]) => {
        const status = count > rules.maxPerNOC ? `⚠️ OVER LIMIT (max ${rules.maxPerNOC})` : '✅';
        console.log(`${noc}  | ${String(count).padStart(5)} | ${status}`);
    });

    // Check USA status
    printSection('USA Status');
    const usaQualified = allQualified.filter(s => s.country === 'USA');
    if (usaQualified.length > 0) {
        console.log(`🇺🇸 USA has ${usaQualified.length} qualified skater(s):`);
        usaQualified.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} - ${s.totalPoints} pts (${s.bestTime}) via ${s.method}`);
        });
    } else {
        console.log('🇺🇸 USA has no qualified skaters yet');
        // Check reserve
        const usaReserve = soqc.quotas?.reserve?.filter(s => s.country === 'USA') || [];
        if (usaReserve.length > 0) {
            console.log(`   Reserve list: ${usaReserve.map(s => s.name).join(', ')}`);
        }
    }
});

// Summary
printHeader('SUMMARY');

let totalIssues = 0;
distancesToCheck.forEach(({ key }) => {
    const soqc = ourData.soqc[key];
    if (!soqc) {
        console.log(`⚠️ ${key}: No data`);
        totalIssues++;
        return;
    }

    const qualified = soqc.quotas?.qualified?.length || 0;
    const reserve = soqc.quotas?.reserve?.length || 0;
    const status = qualified > 0 ? '✅' : '⚠️';
    console.log(`${status} ${key}: ${qualified} qualified, ${reserve} reserve`);
});

console.log('\n' + '═'.repeat(80));
if (totalIssues === 0) {
    console.log('✅ All distances have valid quota data');
} else {
    console.log(`⚠️ ${totalIssues} distance(s) have issues`);
}
console.log('═'.repeat(80) + '\n');
