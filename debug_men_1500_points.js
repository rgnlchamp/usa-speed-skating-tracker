const store = require('./src/data/store_pdf');


async function debugMen1500Points() {
    await store.updateData();
    const state = store.getState();
    const men1500 = state.soqc['1500m-men'];

    const fs = require('fs');
    let output = '';

    if (men1500) {
        output += '--- Reserve List (Raw) ---\n';
        men1500.quotas.reserve.forEach((s, i) => {
            output += `${i + 1}. ${s.name} (Points: ${s.points}, Total: ${s.totalPoints})\n`;
        });

        output += '\n--- Search for Jílek ---\n';
        const allSkaters = men1500.quotas.qualified.concat(men1500.quotas.reserve);
        const jilek = allSkaters.find(s => s.name.includes('Jílek') || s.name.includes('Jilek'));
        if (jilek) {
            output += JSON.stringify(jilek, null, 2) + '\n';
        } else {
            output += 'Jílek not found in qualified or reserve.\n';
        }

        output += '\n--- Search for Indra Medard ---\n';
        const medard = allSkaters.find(s => s.name.includes('Medard'));
        if (medard) {
            output += JSON.stringify(medard, null, 2) + '\n';
        } else {
            output += 'Indra Medard not found in qualified or reserve.\n';
        }
    }

    fs.writeFileSync('debug_men_1500_points_view.js', output);
    console.log('Output written to debug_men_1500_points_view.js');
}

debugMen1500Points();
