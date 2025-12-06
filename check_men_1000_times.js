const store = require('./src/data/store_pdf');
const { calculateSOQCTimes } = require('./src/logic/qualification_rules_v2');

async function checkMen1000Times() {
    await store.updateData();
    const state = store.getState();

    // Get all Men 1000m results
    const results = [];
    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) results.push(...race.results);
    });

    // Calculate SOQC Times ranking
    const soqcTimes = calculateSOQCTimes(results);

    console.log('--- Top 35 Men 1000m Times ---');
    soqcTimes.slice(0, 35).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) ${s.bestTime}`);
    });

    const yankun = soqcTimes.find(s => s.name.includes('Yankun'));
    console.log(`\nYankun Rank: ${soqcTimes.indexOf(yankun) + 1}`);
}

checkMen1000Times();
