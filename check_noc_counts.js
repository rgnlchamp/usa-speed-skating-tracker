const store = require('./src/data/store_pdf');

async function checkNocCounts() {
    await store.updateData();
    const state = store.getState();
    const men1000 = state.soqc['1000m-men'];

    const canCount = men1000.quotas.qualified.filter(q => q.country === 'CAN').length;
    const espCount = men1000.quotas.qualified.filter(q => q.country === 'ESP').length;

    console.log(`Men 1000m Qualified Count:`);
    console.log(`CAN: ${canCount}`);
    console.log(`ESP: ${espCount}`);
}

checkNocCounts();
