const store = require('./src/data/store_pdf');

async function debugWomen5000() {
    await store.updateData();
    const state = store.getState();

    // Check Women's 5000m
    const event5k = state.soqc['5000m-women'];
    const event3k = state.soqc['3000m-women'];

    console.log('\n=== Women 5000m - Points Ranking (Top 5) ===');
    event5k.points.slice(0, 5).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Total Points: ${s.totalPoints}, Best Time: ${s.bestTime}`);
    });

    console.log('\n=== Women 3000m - Points Ranking (Top 5) ===');
    event3k.points.slice(0, 5).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Total Points: ${s.totalPoints}, Best Time: ${s.bestTime}`);
    });

    console.log('\n=== Women 5000m - Times Ranking (Top 5) ===');
    event5k.times.slice(0, 5).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Best Time: ${s.bestTime}, Total Points: ${s.totalPoints}`);
    });

    console.log('\n=== Women 3000m - Times Ranking (Top 5) ===');
    event3k.times.slice(0, 5).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - Best Time: ${s.bestTime}, Total Points: ${s.totalPoints}`);
    });
}

debugWomen5000();
