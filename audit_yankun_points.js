const store = require('./src/data/store_pdf');

async function auditYankunPoints() {
    await store.updateData();
    const state = store.getState();

    console.log('--- Manual Audit: Yankun Zhao (Men 1000m) ---');

    let manualTotal = 0;
    const races = [];

    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) {
            const result = race.results.find(r => r.name.includes('Yankun'));
            if (result) {
                console.log(`[${wc}] Division ${race.division}: Rank ${result.rank}, Points: "${result.points}"`);
                manualTotal += (parseInt(result.points) || 0);
                races.push(result);
            } else {
                console.log(`[${wc}] Division ${race.division}: Not found`);
            }
        }
    });

    console.log(`\nManual Total: ${manualTotal}`);

    // Check if name normalization is causing split entries
    const allNames = [];
    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) {
            race.results.forEach(r => {
                if (r.name.includes('Yankun') || r.name.includes('Zhao')) {
                    allNames.push({ name: r.name, country: r.country, points: r.points });
                }
            });
        }
    });

    console.log('\nAll "Yankun/Zhao" entries found:');
    allNames.forEach(n => console.log(`- ${n.name} (${n.country}) Points: ${n.points}`));
}

auditYankunPoints();
