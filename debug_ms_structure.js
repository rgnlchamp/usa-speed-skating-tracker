const store = require('./src/data/store_pdf');

async function inspectStructure() {
    await store.updateData();
    const state = store.getState();
    const msMen = state.soqc['Mass Start-women']; // Changed to women

    if (msMen) {
        const skaters = msMen.quotas.qualified.concat(msMen.quotas.reserve);
        const targets = ['Valerie Maltais', 'Bente Kerkhoff', 'Sandrine Tas'];

        targets.forEach(target => {
            const skater = skaters.find(s => s.name.includes(target) || s.name.includes(target.split(' ')[1]));
            if (skater) {
                console.log(`\n--- ${target} ---`);
                console.log(JSON.stringify(skater, null, 2));
            } else {
                console.log(`\n${target} not found in App data.`);
            }
        });
    } else {
        console.log('No Mass Start-women data found.');
    }
}

inspectStructure();
