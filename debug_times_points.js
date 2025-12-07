const store = require('./src/data/store_pdf');

async function debugTimesPoints() {
    await store.updateData();
    const state = store.getState();

    // Check Men's 10000m
    const event = state.soqc['10000m-men'];

    console.log('\n=== Men 10000m - Times Ranking ===');
    console.log('Top 10 times:');
    event.times.slice(0, 10).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Time: ${s.bestTime}, Total Points: ${s.totalPoints}`);
    });

    console.log('\n=== Times Qualifiers (from quotas) ===');
    const timesQualifiers = event.quotas.qualified.filter(s => s.method === 'Times');
    timesQualifiers.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Time: ${s.bestTime}, Total Points: ${s.totalPoints}`);
    });

    console.log('\n=== Points Ranking ===');
    console.log('Top 10 points:');
    event.points.slice(0, 10).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Total Points: ${s.totalPoints}, Best Time: ${s.bestTime}`);
    });
}

debugTimesPoints();
