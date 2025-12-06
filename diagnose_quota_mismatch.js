const store = require('./src/data/store_pdf');
const { calculateSOQCPoints, calculateSOQCTimes, allocateQuotas } = require('./src/logic/qualification_rules_v2');

async function diagnoseQuotaMismatch() {
    console.log('=== QUOTA MISMATCH DIAGNOSTIC ===\n');

    await store.updateData();
    const state = store.getState();

    // Focus on Men 500m - known mismatch
    console.log('Target: Men 500m');
    console.log('Expected: 23 Points, 13 Times');
    console.log('Actual from app:', state.soqc['500m-men']?.quotas.qualified.filter(q => q.method === 'Points').length, 'Points');
    console.log('Actual from app:', state.soqc['500m-men']?.quotas.qualified.filter(q => q.method === 'Times').length, 'Times\n');

    // Get raw results
    const results = [];
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '500m' && r.gender === 'men');
        if (races) {
            races.forEach(race => results.push(...race.results));
        }
    });

    console.log(`Total 500m men results collected: ${results.length}`);

    // Count unique skaters
    const uniqueSkaters = new Set();
    results.forEach(r => uniqueSkaters.add(`${r.name}|${r.country}`));
    console.log(`Unique skaters: ${uniqueSkaters.size}\n`);

    // Check division distribution
    const divisionCount = {};
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '500m' && r.gender === 'men');
        if (races) {
            races.forEach(race => {
                const key = `${wc} ${race.division}`;
                divisionCount[key] = race.results.length;
            });
        }
    });

    console.log('Division breakdown:');
    Object.entries(divisionCount).forEach(([div, count]) => {
        console.log(`  ${div}: ${count} results`);
    });

    // Check if we're missing Division A races
    const hasWC1DivA = state.raceResults['WC1']?.some(r => r.distance === '500m' && r.gender === 'men' && r.division === 'A');
    const hasWC2DivA = state.raceResults['WC2']?.some(r => r.distance === '500m' && r.gender === 'men' && r.division === 'A');

    console.log(`\nHas WC1 Division A: ${hasWC1DivA}`);
    console.log(`Has WC2 Division A: ${hasWC2DivA}`);

    // List all race files loaded
    console.log('\nAll Men 500m races loaded:');
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '500m' && r.gender === 'men');
        if (races) {
            races.forEach(race => {
                console.log(`  ${wc}: ${race.name} - ${race.results.length} skaters`);
            });
        }
    });

    // Check specific missing athletes from comparison
    const missingAthletes = [
        'Tatsuya Shinhama',
        'Katsuhiro Kuratsubo',
        'Haonan Du',
        'Stefan Westenbroek',
        'Anders Johnson',
        'Merijn Scheperkamp',
        'Yankun Zhao',
        'Sanghyeok Cho'
    ];

    console.log('\nSearching for missing athletes in raw data:');
    missingAthletes.forEach(name => {
        const found = results.find(r => r.name.includes(name) || name.includes(r.name));
        if (found) {
            console.log(`  ✓ ${name}: Found as "${found.name}" (${found.country}) Pts:${found.points} Time:${found.time}`);
        } else {
            console.log(`  ✗ ${name}: NOT FOUND IN DATA`);
        }
    });
}

diagnoseQuotaMismatch();
