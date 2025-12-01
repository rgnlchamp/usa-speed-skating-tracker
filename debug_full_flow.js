const store = require('./src/data/store');
const { getEventSchedule, getCompetitionResults } = require('./src/data/data_fetcher');

(async () => {
    console.log("=== STARTING FULL DEBUG FLOW ===");

    const eventId = '2026_USA_0001';
    console.log(`1. Fetching schedule for ${eventId}...`);
    const schedule = await getEventSchedule(eventId);
    console.log(`   Found ${schedule.length} competitions.`);

    if (schedule.length === 0) {
        console.error("!!! CRITICAL: No competitions found in schedule.");
        return;
    }

    // Find a 500m competition to test
    const comp = schedule.find(c => c.name.includes('500m'));
    if (!comp) {
        console.error("!!! CRITICAL: No 500m competition found to test.");
        console.log("Available competitions:", schedule.map(s => s.name));
        return;
    }

    console.log(`2. Testing competition: ${comp.name} (ID: ${comp.id})`);
    console.log(`   URL: ${comp.url}`);

    console.log(`3. Fetching results...`);
    const results = await getCompetitionResults(eventId, comp.id);

    if (!results) {
        console.error("!!! CRITICAL: Results returned null.");
    } else if (results.length === 0) {
        console.error("!!! CRITICAL: Results array is empty.");
    } else {
        console.log(`   Success! Found ${results.length} results.`);
        console.log(`   First result:`, JSON.stringify(results[0], null, 2));
        console.log(`   Country of first result: '${results[0].skater.country}'`);
    }

    console.log("4. Running Store Update...");
    await store.updateData();

    const state = store.getState();
    const soqcKeys = Object.keys(state.soqc);
    console.log(`5. Final State SOQC Keys: ${JSON.stringify(soqcKeys)}`);

    if (soqcKeys.length > 0) {
        console.log("   SOQC Data found for:", soqcKeys[0]);
        console.log("   Qualified count:", state.soqc[soqcKeys[0]].quotas.qualified.length);
    } else {
        console.error("!!! CRITICAL: SOQC state is empty after update.");
    }

    console.log("=== DEBUG COMPLETE ===");
})();
