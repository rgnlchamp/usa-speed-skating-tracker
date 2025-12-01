const store = require('./src/data/store');

(async () => {
    console.log("Running state dump debug...");
    await store.updateData();

    const state = store.getState();
    console.log("Final SOQC State Keys:", Object.keys(state.soqc));

    if (Object.keys(state.soqc).length > 0) {
        const firstKey = Object.keys(state.soqc)[0];
        console.log(`SOQC[${firstKey}] Quotas:`, JSON.stringify(state.soqc[firstKey].quotas, null, 2));
    } else {
        console.log("SOQC is empty!");
        console.log("Results keys:", Object.keys(state.results));
        if (Object.keys(state.results).length > 0) {
            const eventId = Object.keys(state.results)[0];
            console.log(`Results[${eventId}] keys:`, Object.keys(state.results[eventId]));
        }
    }
})();
