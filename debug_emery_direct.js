const store = require('./src/data/store_pdf');

async function run() {
    console.log('Loading data...');
    await store.updateData();
    const state = store.getState();

    const fs = require('fs');
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    log('\n=== FINDING EMERY LEHMAN IN 5000M MEN ===\n');

    const allRaces = state.raceResults.WC1 || [];
    const men5000Races = allRaces.filter(r => r.distance === '5000m' && r.gender === 'men');

    log(`Total 5000m men races: ${men5000Races.length}\n`);

    men5000Races.forEach((race, i) => {
        log(`Race ${i + 1}: ${race.division} - ${race.url}`);
        const skater = race.results.find(r => r.name.includes('CEPURAN'));
        if (skater) {
            log(`  ⚠️ FOUND: ${skater.name} - Rank ${skater.rank}, Time ${skater.time}`);
        } else {
            log(`  ✓ Not found in this race`);
        }
    });

    fs.writeFileSync('emery_result_utf8.txt', output, 'utf8');
    console.log('Output written to emery_result_utf8.txt');
}

run().catch(console.error);
