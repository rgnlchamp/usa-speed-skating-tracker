const store = require('./src/data/store_pdf');

(async () => {
    await store.updateData();
    const state = store.getState();

    console.log('\n=== DEBUGGING BEST TIME CALCULATION ===\n');

    // Check raw race data
    const allRaces = state.raceResults.WC1;
    const women500races = allRaces.filter(r => r.distance === '500m' && r.gender === 'women');

    console.log(`Total Women's 500m races: ${women500races.length}\n`);

    // Find all results for Jutta across all races
    console.log('JUTTA LEERDAM across all races:');
    women500races.forEach((race, i) => {
        const jutta = race.results.find(r => r.name.includes('LEERDAM'));
        if (jutta) {
            console.log(`  Race ${i + 1} (${race.division}): ${jutta.time} (${jutta.points} pts)`);
        }
    });

    console.log('\nMARRIT FLEDDERUS across all races:');
    women500races.forEach((race, i) => {
        const marrit = race.results.find(r => r.name.includes('FLEDDERUS'));
        if (marrit) {
            console.log(`  Race ${i + 1} (${race.division}): ${marrit.time} (${marrit.points} pts)`);
        }
    });

    // Check the final calculated best times
    const women500soqc = state.soqc['500m-women'];
    const juttaFinal = women500soqc.times.find(a => a.name.includes('LEERDAM'));
    const marritFinal = women500soqc.times.find(a => a.name.includes('FLEDDERUS'));

    console.log('\n=== FINAL CALCULATED BEST TIMES ===');
    console.log(`Jutta LEERDAM: ${juttaFinal ? juttaFinal.bestTime : 'NOT FOUND'}`);
    console.log(`Marrit FLEDDERUS: ${marritFinal ? marritFinal.bestTime : 'NOT FOUND'}`);

    // Expected from Nov 23 PDF: Jutta 37.01, Marrit 37.08
    console.log('\n=== EXPECTED (from Nov 23 PDF) ===');
    console.log('Jutta: 37.01');
    console.log('Marrit: 37.08');
})();
