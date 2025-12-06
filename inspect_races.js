const store = require('./src/data/store_pdf');

async function inspectRaceResults() {
    await store.updateData();
    const state = store.getState();

    console.log('Race Results Keys:', Object.keys(state.raceResults));

    const wc1 = state.raceResults['WC1'];
    if (wc1) {
        console.log('WC1 Races:');
        wc1.forEach(race => {
            console.log(`  - ${race.distance} ${race.gender} (${race.results.length} skaters)`);
        });
    } else {
        console.log('No WC1 results found.');
    }

    // Check specifically for 10000m Men and 5000m Women
    const has10kMen = wc1?.some(r => r.distance === '10000m' && r.gender === 'men');
    const has5kWomen = wc1?.some(r => r.distance === '5000m' && r.gender === 'women');

    console.log(`\nHas 10000m Men: ${has10kMen}`);
    console.log(`Has 5000m Women: ${has5kWomen}`);
}

inspectRaceResults();
