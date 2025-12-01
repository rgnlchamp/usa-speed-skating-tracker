const store = require('./src/data/store');

(async () => {
    console.log("Running store update debug...");
    await store.updateData();
    console.log("Update complete.");
    console.log("State:", JSON.stringify(store.getState(), null, 2));
})();
