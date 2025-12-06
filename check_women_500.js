const store = require('./src/data/store_pdf');
const fs = require('fs');

async function run() {
    console.log('Loading data...');
    try {
        await store.updateData();
        console.log('Data loaded successfully.');
    } catch (e) {
        console.error('Failed to load data:', e);
        return;
    }

    const state = store.getState();
    const eventKey = '500m-women';
    console.log(`Checking ${eventKey}...`);
    const data = state.soqc[eventKey];

    if (!data) {
        console.log(`No data found for ${eventKey}`);
        if (state.soqc) {
            console.log('Available keys:', Object.keys(state.soqc));
        } else {
            console.log('state.soqc is undefined');
        }
        return;
    }

    let output = `=== ${eventKey.toUpperCase()} QUOTA LIST ===\n\n`;

    // Qualified
    output += 'Qualified:\n';
    if (data.quotas && data.quotas.qualified) {
        data.quotas.qualified.forEach((skater, index) => {
            output += `${index + 1}. ${skater.name} (${skater.country}) - ${skater.method}\n`;
        });
    }

    // Reserve
    output += '\nReserve:\n';
    if (data.quotas && data.quotas.reserve) {
        data.quotas.reserve.forEach((skater, index) => {
            output += `R${index + 1}. ${skater.name} (${skater.country})\n`;
        });
    }

    console.log(output);
    fs.writeFileSync('women_500_check.txt', output, 'utf8');
}

run().catch(console.error);
