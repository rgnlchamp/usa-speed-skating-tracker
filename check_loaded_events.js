const store = require('./src/data/store_pdf');

async function run() {
    console.log('Loading data...');
    await store.updateData();
    const state = store.getState();

    console.log('\n=== LOADED EVENTS ===\n');
    const eventCounts = {};

    Object.values(state.raceResults).forEach(races => {
        races.forEach(race => {
            const key = `${race.distance} ${race.gender}`;
            if (!eventCounts[key]) eventCounts[key] = 0;
            eventCounts[key]++;
            console.log(`Found: ${key} - ${race.division} (${race.results.length} results)`);
        });
    });

    console.log('\n=== SUMMARY ===\n');
    console.log(eventCounts);
}

run().catch(console.error);
