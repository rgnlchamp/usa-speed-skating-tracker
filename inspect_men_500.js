const store = require('./src/data/store_pdf');

async function inspectMen500() {
    await store.updateData();
    const state = store.getState();

    const men500 = state.soqc['500m-men'];
    if (!men500) {
        console.log('No data for 500m-men');
        return;
    }

    console.log('--- Points Qualifiers ---');
    men500.quotas.qualified.filter(q => q.method === 'Points').forEach(q => {
        console.log(`${q.rank} ${q.name} (${q.country}) Points: ${q.points}`);
    });

    console.log('\n--- Times Qualifiers ---');
    men500.quotas.qualified.filter(q => q.method === 'Times').forEach(q => {
        console.log(`${q.rank} ${q.name} (${q.country}) Time: ${q.time}`);
    });

    console.log('\n--- Reserve ---');
    men500.quotas.reserve.forEach(q => {
        console.log(`${q.rank} ${q.name} (${q.country})`);
    });
}

inspectMen500();
