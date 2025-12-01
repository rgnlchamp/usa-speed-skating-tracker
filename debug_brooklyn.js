const { fetchEventDataFromPDFs } = require('./src/data/pdf_data_fetcher');
const { calculateSOQCPoints } = require('./src/logic/qualification_rules_v2');

(async () => {
    console.log('=== Investigating Brooklyn McDougall Points ===\n');

    const races = await fetchEventDataFromPDFs();

    // Get all women's 500m races
    const w500mRaces = races.filter(r => r.distance === '500m' && r.gender === 'women');
    console.log(`Women's 500m races: ${w500mRaces.length}\n`);

    // Collect all results
    const allResults = [];
    w500mRaces.forEach(race => {
        console.log(`${race.name}:`);

        // Find Brooklyn in this race
        const brooklynInRace = race.results.filter(r =>
            r.name.toLowerCase().includes('brooklyn') ||
            r.name.toLowerCase().includes('mcdougall')
        );

        if (brooklynInRace.length > 0) {
            brooklynInRace.forEach(f => {
                console.log(`  ✓ Found: ${f.name} (${f.country}) - Rank ${f.rank}, Time: ${f.time}, Points: ${f.points}`);
            });
        } else {
            console.log(`  - Brooklyn not found in this race`);
        }

        allResults.push(...race.results);
    });

    // Calculate SOQC Points
    console.log('\n=== SOQC Points Calculation ===');
    const soqcPoints = calculateSOQCPoints(allResults);

    // Find Brooklyn in the aggregated results
    const brooklyn = soqcPoints.find(s =>
        s.name.toLowerCase().includes('brooklyn') ||
        s.name.toLowerCase().includes('mcdougall')
    );

    if (brooklyn) {
        const rank = soqcPoints.indexOf(brooklyn) + 1;
        console.log(`\nBrooklyn's SOQC Points Ranking: #${rank}`);
        console.log(`  Name: ${brooklyn.name}`);
        console.log(`  Country: ${brooklyn.country}`);
        console.log(`  Total Points: ${brooklyn.totalPoints}`);
        console.log(`  Best Time: ${brooklyn.bestTime}`);
        console.log(`  Number of races: ${brooklyn.races.length}`);
        console.log(`\n  Race details:`);
        brooklyn.races.forEach((r, i) => {
            console.log(`    Race ${i + 1}: Rank ${r.rank}, Time ${r.time}, Points ${r.points}`);
        });

        // Manually calculate points
        const manualSum = brooklyn.races.reduce((sum, r) => sum + (parseInt(r.points) || 0), 0);
        console.log(`\n  Manual points calculation: ${brooklyn.races.map(r => r.points).join(' + ')} = ${manualSum}`);
        console.log(`  System calculation: ${brooklyn.totalPoints}`);
        if (manualSum !== brooklyn.totalPoints) {
            console.log(`  ⚠️ MISMATCH!`);
        }
    } else {
        console.log('\nBrooklyn not found in SOQC rankings!');
    }
})();
