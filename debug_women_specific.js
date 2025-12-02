const fs = require('fs');
const store = require('./src/data/store_pdf');

const SKATERS = [
    { name: 'Marijke Groenewoud', event: '1500m-women' },
    { name: 'Jiaxuan Li', event: '1500m-women' },
    { name: 'Ellia Smeding', event: '1500m-women' },
    { name: 'Brooklyn McDougall', event: '500m-women' },
    { name: 'Carolina Hiller', event: '500m-women' } // Check partial name
];

async function debug() {
    // Suppress console.log during data loading
    const originalLog = console.log;
    console.log = () => { };

    await store.updateData();

    // Restore console.log
    console.log = originalLog;

    const state = store.getState();

    let output = '\n--- Women Specific Debug ---\n';

    SKATERS.forEach(item => {
        const eventData = state.soqc[item.event];
        const name = item.name;
        output += `\nChecking: ${name} in ${item.event}\n`;

        if (!eventData) {
            output += `  [Error] Event ${item.event} not found\n`;
            return;
        }

        // Check Points Ranking
        const pRank = eventData.points.find(s => s.name === name);
        if (pRank) {
            output += `  [Points] Rank: ${eventData.points.indexOf(pRank) + 1}, Name: "${pRank.name}", Points: ${pRank.totalPoints}, Time: ${pRank.bestTime}\n`;
            pRank.races.forEach(r => {
                output += `    - ${r.eventId}: ${r.points} pts, ${r.time}\n`;
            });
        } else {
            output += `  [Points] Not found in ranking\n`;
        }

        // Check Times Ranking
        const tRank = eventData.times.find(s => s.name === name);
        if (tRank) {
            output += `  [Times] Rank: ${eventData.times.indexOf(tRank) + 1}, Name: "${tRank.name}", Time: ${tRank.bestTime}, Points: ${tRank.totalPoints}\n`;
        } else {
            output += `  [Times] Not found in ranking\n`;
        }
    });

    fs.writeFileSync('debug_women_specific.md', output);
    console.log('Debug output saved to debug_women_specific.md');
}

debug();
