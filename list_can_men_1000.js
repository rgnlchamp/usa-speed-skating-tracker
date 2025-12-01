const store = require('./src/data/store_pdf');

async function listCanMen1000() {
    await store.updateData();
    const state = store.getState();
    const men1000 = state.soqc['1000m-men'];

    console.log('--- Qualified CAN Skaters (Men 1000m) ---');
    men1000.quotas.qualified
        .filter(q => q.country === 'CAN')
        .forEach((q, index) => {
            console.log(`CAN_QUALIFIER: ${q.name}`);
        });
}

listCanMen1000();
