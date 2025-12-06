const store = require('./src/data/store_pdf');

async function checkNames() {
    await store.updateData();
    const state = store.getState();

    const key = '500m-men';
    if (state.soqc[key]) {
        console.log(`\n--- Names in ${key} ---`);
        state.soqc[key].quotas.qualified.slice(0, 5).forEach(q => {
            console.log(`Name: "${q.name}", Nation: "${q.nation}"`);
        });
    } else {
        console.log(`Key ${key} not found in state.`);
        console.log('Available keys:', Object.keys(state.soqc));
    }
}

checkNames();
