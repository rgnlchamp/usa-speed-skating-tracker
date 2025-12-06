const store = require('./src/data/store_pdf');
const { calculateSOQCPoints } = require('./src/logic/qualification_rules_v2');

async function checkPointsThreshold() {
    await store.updateData();
    const state = store.getState();

    const results = [];
    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) results.push(...race.results);
    });

    const soqcPoints = calculateSOQCPoints(results);

    console.log('--- Men 1000m Points Ranking ---');
    soqcPoints.slice(0, 25).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) Points: ${s.totalPoints}`);
    });

    const yankun = soqcPoints.find(s => s.name.includes('Yankun'));
    if (yankun) {
        console.log(`\nYankun Zhao Rank: ${soqcPoints.indexOf(yankun) + 1} Points: ${yankun.totalPoints}`);
    }
}

checkPointsThreshold();
