const store = require('./src/data/store_pdf');

async function inspect() {
    console.log('Loading App Data...');
    await store.updateData();
    const state = store.getState();
    const men500 = state.soqc['500m-men'];

    if (!men500) {
        console.log('No data for 500m-men');
        return;
    }

    console.log('--- Men 500m Points Ranking (Top 30) ---');
    men500.points.slice(0, 30).forEach((s, i) => {
        if (s.name.includes('Shinhama') || s.name.includes('Murakami') || s.country === 'JPN') {
            console.log(`${i + 1}. ${s.name} (${s.country}): ${s.totalPoints} pts`);
        }
    });

    console.log('\n--- Men 500m Times Ranking (Top 30) ---');
    men500.times.slice(0, 30).forEach((s, i) => {
        if (s.name.includes('Shinhama') || s.name.includes('Murakami') || s.country === 'JPN') {
            console.log(`${i + 1}. "${s.name}" (${s.country}): ${s.bestTime}`);
            console.log(`   Char codes: ${s.name.split('').map(c => c.charCodeAt(0)).join(',')}`);
        }
    });
}

inspect();
