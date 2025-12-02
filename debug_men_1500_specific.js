const fs = require('fs');
const store = require('./src/data/store_pdf');

const SKATERS = [
    'David Larue',
    'Valentin Thiebault',
    'Casey Dawson',
    'Mathias Vosté',
    'Hendrik Dombek',
    'Antoine Gélinas-Beaulieu',
    'Szymon Wojtakowski',
    'Indra Medard'
];

async function debug() {
    // Suppress console.log during data loading
    const originalLog = console.log;
    console.log = () => { };

    await store.updateData();

    // Restore console.log
    console.log = originalLog;

    const state = store.getState();
    const men1500 = state.soqc['1500m-men'];

    let output = '\n--- Men 1500m Debug ---\n';

    SKATERS.forEach(name => {
        output += `\nChecking: ${name}\n`;

        // Check Points Ranking
        const pRank = men1500.points.find(s => s.name.includes(name) || s.name.includes(name.split(' ').pop()));
        if (pRank) {
            output += `  [Points] Rank: ${men1500.points.indexOf(pRank) + 1}, Points: ${pRank.totalPoints}, Time: ${pRank.bestTime}\n`;
            pRank.races.forEach(r => {
                output += `    - ${r.eventId}: ${r.points} pts, ${r.time}\n`;
            });
        } else {
            output += `  [Points] Not found in ranking\n`;
        }

        // Check Times Ranking
        const tRank = men1500.times.find(s => s.name.includes(name) || s.name.includes(name.split(' ').pop()));
        if (tRank) {
            output += `  [Times] Rank: ${men1500.times.indexOf(tRank) + 1}, Time: ${tRank.bestTime}, Points: ${tRank.totalPoints}\n`;
        } else {
            output += `  [Times] Not found in ranking\n`;
        }

        // Check Qualification Status
        const qualified = men1500.quotas.qualified.find(s => s.name.includes(name) || s.name.includes(name.split(' ').pop()));
        if (qualified) {
            output += `  [Status] Qualified via ${qualified.method}\n`;
        } else {
            const reserve = men1500.quotas.reserve.find(s => s.name.includes(name) || s.name.includes(name.split(' ').pop()));
            if (reserve) {
                output += `  [Status] Reserve #${men1500.quotas.reserve.indexOf(reserve) + 1}\n`;
            } else {
                output += `  [Status] Not qualified\n`;
            }
        }
    });

    fs.writeFileSync('debug_men_1500_clean.md', output);
    console.log('Debug output saved to debug_men_1500_clean.md');
}

debug();
