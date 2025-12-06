const store = require('./src/data/store_pdf');
const fs = require('fs');

async function run() {
    console.log('Loading data...');
    try {
        await store.updateData();
    } catch (e) {
        console.error(e);
        return;
    }

    const state = store.getState();
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    const events = Object.keys(state.soqc).sort();

    for (const eventKey of events) {
        const data = state.soqc[eventKey];
        log(`\n=== ${eventKey.toUpperCase()} ===`);

        log('Qualified:');
        if (data.quotas && data.quotas.qualified) {
            data.quotas.qualified.forEach((skater, index) => {
                log(`  ${index + 1}. ${skater.name} (${skater.country}) - ${skater.method}`);
            });
        }

        log('Reserve:');
        if (data.quotas && data.quotas.reserve) {
            data.quotas.reserve.forEach((skater, index) => {
                log(`  R${index + 1}. ${skater.name} (${skater.country})`);
            });
        }
    }

    fs.writeFileSync('all_quotas_check.txt', output, 'utf8');
    console.log('\nOutput written to all_quotas_check.txt');
}

run();
