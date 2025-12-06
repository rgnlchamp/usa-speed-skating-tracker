const store = require('./src/data/store_pdf');

async function traceDataFlow() {
    await store.updateData();
    const state = store.getState();

    console.log('=== TRACING DATA FLOW FOR MEN 500M ===\n');

    // Step 1: Check raw race results
    console.log('Step 1: Raw raceResults from PDF parser');
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '500m' && r.gender === 'men');
        console.log(`${wc}: ${races?.length || 0} races`);
        if (races) {
            races.forEach(race => {
                const key = `${race.distance}-${race.gender}`;
                console.log(`  Division ${race.division}: ${race.results.length} skaters, key would be "${key}"`);

                // Check for specific missing athlete
                const sanghyeok = race.results.find(r => r.name.toLowerCase().includes('sanghyeok'));
                if (sanghyeok) {
                    console.log(`    → Found Sanghyeok: ${JSON.stringify(sanghyeok)}`);
                }
            });
        }
    });

    // Step 2: Check SOQC state
    console.log('\nStep 2: SOQC aggregated results');
    const men500key = '500m-men';
    if (state.soqc[men500key]) {
        const soqc = state.soqc[men500key];
        console.log(`Key "${men500key}" exists in SOQC`);
        console.log(`  Points ranking: ${soqc.points.length} skaters`);
        console.log(`  Times ranking: ${soqc.times.length} skaters`);
        console.log(`  Qualified (Points): ${soqc.quotas.qualified.filter(q => q.method === 'Points').length}`);
        console.log(`  Qualified (Times): ${soqc.quotas.qualified.filter(q => q.method === 'Times').length}`);
        console.log(`  Reserve: ${soqc.quotas.reserve.length}`);

        // Check if Sanghyeok is in points ranking
        const sanghyeokPoints = soqc.points.find(s => s.name.toLowerCase().includes('sanghyeok'));
        console.log(`  Sanghyeok in points ranking: ${sanghyeokPoints ? `Yes (Rank ${soqc.points.indexOf(sanghyeokPoints) + 1})` : 'NO'}`);

        // Check if Sanghyeok is in times ranking
        const sanghyeokTimes = soqc.times.find(s => s.name.toLowerCase().includes('sanghyeok'));
        console.log(`  Sanghyeok in times ranking: ${sanghyeokTimes ? `Yes (Rank ${soqc.times.indexOf(sanghyeokTimes) + 1})` : 'NO'}`);

        // Check if in qualified list
        const sanghyeokQual = soqc.quotas.qualified.find(s => s.name.toLowerCase().includes('sanghyeok'));
        console.log(`  Sanghyeok in qualified: ${sanghyeokQual ? `Yes (${sanghyeokQual.method})` : 'NO'}`);
    } else {
        console.log(`ERROR: Key "${men500key}" NOT FOUND in SOQC!`);
        console.log('Available keys:', Object.keys(state.soqc));
    }
}

traceDataFlow();
