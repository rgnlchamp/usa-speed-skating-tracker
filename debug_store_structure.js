const store = require('./src/data/store_pdf');

(async () => {
    await store.updateData();
    const state = store.getState();

    console.log('=== STORE STRUCTURE ===');
    console.log('Keys:', Object.keys(state));
    console.log('\n=== EVENTS ===');
    if (state.events) {
        console.log('Number of events:', state.events.length);
        state.events.forEach((event, i) => {
            console.log(`\nEvent ${i}: ${event.title || event.id}`);
            console.log('  Keys:', Object.keys(event));
            if (event.races) {
                console.log(`  Number of races: ${event.races.length}`);
                event.races.slice(0, 2).forEach(race => {
                    console.log(`    - ${race.distance} ${race.gender} Div ${race.division}: ${race.results ? race.results.length : 0} results`);
                });
            }
        });
    } else {
        console.log('No events property!');
    }

    console.log('\n=== SOQC ===');
    if (state.soqc) {
        console.log('SOQC keys:', Object.keys(state.soqc));
        if (state.soqc['500m-women']) {
            console.log('500m-women keys:', Object.keys(state.soqc['500m-women']));
            console.log('  Points qualifiers:', state.soqc['500m-women'].points ? state.soqc['500m-women'].points.length : 0);
            console.log('  Time qualifiers:', state.soqc['500m-women'].times ? state.soqc['500m-women'].times.length : 0);
        }
    }
})();
