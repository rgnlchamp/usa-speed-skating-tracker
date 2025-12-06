const store = require('./src/data/store_pdf');

async function debugCZE() {
    await store.updateData();
    const state = store.getState();
    const men1500 = state.soqc['1500m-men'];

    if (men1500) {
        const qualified = men1500.quotas.qualified;
        const czeSkaters = qualified.filter(s => s.nation === 'CZE' || s.country === 'CZE');

        console.log(`--- CZE Qualified Skaters (${czeSkaters.length}) ---`);
        czeSkaters.forEach(s => {
            console.log(`${s.rank} ${s.name} (${s.points || s.totalPoints})`);
        });

        const allSkaters = qualified.concat(men1500.quotas.reserve);

        const jilek = allSkaters.find(s => s.name.includes('Jílek') || s.name.includes('Jilek'));
        console.log('\n--- Jílek ---');
        if (jilek) {
            console.log(`Points: ${jilek.points}, Total: ${jilek.totalPoints}`);
            console.log('Races:', JSON.stringify(jilek.races, null, 2));
        } else {
            console.log('Not found');
        }

        const medard = allSkaters.find(s => s.name.includes('Medard'));
        console.log('\n--- Medard ---');
        if (medard) {
            console.log(`Points: ${medard.points}, Total: ${medard.totalPoints}`);
            console.log('Races:', JSON.stringify(medard.races, null, 2));
        } else {
            console.log('Not found');
        }
    }
}

debugCZE();
