const store = require('./src/data/store_pdf');

async function checkYankunDivision() {
    await store.updateData();
    const state = store.getState();

    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) {
            const result = race.results.find(r => r.name.includes('Yankun'));
            if (result) {
                console.log(`${wc}: Division ${race.division}, Rank ${result.rank}, Points ${result.points}`);
            }
        }
    });
}

checkYankunDivision();
