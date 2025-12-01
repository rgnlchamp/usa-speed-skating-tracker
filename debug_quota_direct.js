const store = require('./src/data/store_pdf');

async function run() {
    console.log('Loading data...');
    await store.updateData();
    const state = store.getState();

    const fs = require('fs');
    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    log('\n=== 5000M MEN - USA QUOTA ISSUE ===\n');
    const men5000 = state.soqc['5000m-men'];

    if (men5000) {
        // Show all qualified skaters
        log('All qualified skaters:');
        const nocCounts = {};
        men5000.quotas.qualified.forEach((skater, i) => {
            nocCounts[skater.country] = (nocCounts[skater.country] || 0) + 1;
            const flag = skater.country === 'USA' ? '← USA' : '';
            log(`${(i + 1).toString().padStart(2)}. ${skater.name.padEnd(30)} ${skater.country} (${skater.method}) ${flag}`);
        });

        log('\n=== NOC QUOTA COUNTS ===\n');
        Object.entries(nocCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([country, count]) => {
                const warning = count > 3 ? ' ⚠️ EXCEEDS MAX' : '';
                const usaWarning = country === 'USA' && count > 1 ? ' ⚠️ Should be 1 max for USA' : '';
                log(`${country}: ${count}${warning}${usaWarning}`);
            });

        log('\n=== RESERVE LIST ===\n');
        men5000.quotas.reserve.forEach((skater, i) => {
            log(`${(i + 1).toString().padStart(2)}. ${skater.name.padEnd(30)} ${skater.country}`);
        });
    } else {
        log('No 5000m men data found in SOQC.');
    }

    fs.writeFileSync('quota_result_utf8.txt', output, 'utf8');
    console.log('Output written to quota_result_utf8.txt');
}

run().catch(console.error);
