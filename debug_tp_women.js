const store = require('./src/data/store_pdf');
const fs = require('fs');

async function debugTP() {
    await store.updateData();
    const state = store.getState();
    const tpWomen = state.soqc['Team Pursuit-women'];

    let output = '';

    if (tpWomen) {
        output += '--- Points Ranking ---\n';
        tpWomen.points.forEach((t, i) => {
            output += `${i + 1}. ${t.country} (Pts: ${t.totalPoints}, Time: ${t.bestTime})\n`;
            if (t.country === 'CHN' || t.country === 'KAZ' || t.country === 'NOR') {
                output += '  Races: ' + JSON.stringify(t.races, null, 2) + '\n';
            }
        });

        output += '\n--- Times Ranking ---\n';
        tpWomen.times.forEach((t, i) => {
            output += `${i + 1}. ${t.country} (Time: ${t.bestTime}, Pts: ${t.totalPoints})\n`;
        });

        output += '\n--- Qualifiers (Points) ---\n';
        const pointsQual = tpWomen.quotas.qualified.filter(q => q.method === 'Points');
        pointsQual.forEach((t, i) => output += `${i + 1}. ${t.country}\n`);

        output += '\n--- Qualifiers (Times) ---\n';
        const timesQual = tpWomen.quotas.qualified.filter(q => q.method === 'Times');
        timesQual.forEach((t, i) => output += `${i + 1}. ${t.country}\n`);
    }

    fs.writeFileSync('debug_tp_women_races.txt', output);
    console.log('Output written to debug_tp_women_races.txt');
}

debugTP();
