const store = require('./src/data/store_pdf');

async function checkYankunRacePoints() {
    await store.updateData();
    const state = store.getState();

    console.log('--- Yankun Zhao Race Results (Men 1000m) ---');
    console.log('RaceResults Keys:', Object.keys(state.raceResults));
    Object.keys(state.raceResults).forEach(k => {
        console.log(`${k}: ${state.raceResults[k].length} races`);
    });

    let totalPoints = 0;
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '1000m' && r.gender === 'men');
        if (races) {
            races.forEach(race => {
                const result = race.results.find(r => r.name.includes('Yankun'));
                if (result) {
                    console.log(`${wc} (${race.division}): Rank ${result.rank}, Time ${result.time}, Points ${result.points}`);
                    totalPoints += (parseInt(result.points) || 0);
                }
            });
        }
    });

    console.log(`Total Points: ${totalPoints}`);
}

checkYankunRacePoints();
