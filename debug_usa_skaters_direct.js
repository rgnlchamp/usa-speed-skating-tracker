const store = require('./src/data/store_pdf');
const fs = require('fs');

async function run() {
    console.log('Loading data...');
    await store.updateData();
    const state = store.getState();

    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    const targetEvent = '500m-women';

    log(`\n=== SEARCHING FOR CZE SKATERS IN ${targetEvent} ===\n`);
    const eventData = state.soqc[targetEvent];

    if (eventData) {
        const czeSkaters = eventData.times.filter(s => s.country === 'CZE');
        if (czeSkaters.length > 0) {
            log(`Found ${czeSkaters.length} CZE skaters:`);
            czeSkaters.forEach(s => {
                log(`  ${s.name} - ${s.bestTime} (${s.totalPoints} pts)`);
            });
        } else {
            log('No CZE skaters found.');
        }
    } else {
        log(`No data found for ${targetEvent}.`);
    }

    fs.writeFileSync('usa_skaters_result.txt', output, 'utf8');
}

run().catch(console.error);
