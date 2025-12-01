const { fetchEventDataFromPDFs } = require('./src/data/pdf_data_fetcher');
const { calculateSOQCPoints } = require('./src/logic/qualification_rules_v2');

(async () => {
    console.log('=== Investigating Femke Kok Point Totals ===\n');

    const races = await fetchEventDataFromPDFs();

    // Get all women's 500m races
    const w500mRaces = races.filter(r => r.distance === '500m' && r.gender === 'women');
    console.log(`Women's 500m races: ${w500mRaces.length}\n`);

    // Collect all results
    const allResults = [];
    w500mRaces.forEach(race => {
        console.log(`${race.name}:`);

        // Find Femke in this race
        const femkeInRace = race.results.filter(r =>
            r.name.toLowerCase().includes('femke') ||
            r.name.toLowerCase().includes('kok')
        );

        if (femkeInRace.length > 0) {
            femkeInRace.forEach(f => {
                console.log(`  ✓ Found: ${f.name} (${f.country}) - Rank ${f.rank}, Time: ${f.time}, Points: ${f.points}`);
            });
        } else {
            console.log(`  - Femke not found in this race`);
        }

        allResults.push(...race.results);
    });

    // Calculate SOQC Points
    console.log('\n=== SOQC Points Calculation ===');
    const soqcPoints = calculateSOQCPoints(allResults);

    // Find Femke in the aggregated results
    const femke = soqcPoints.find(s =>
        s.name.toLowerCase().includes('femke') ||
        s.name.toLowerCase().includes('kok')
    );

    if (femke) {
        const rank = soqcPoints.indexOf(femke) + 1;
        console.log(`\nFemke's SOQC Points Ranking: #${rank}`);
        console.log(`  Name: ${femke.name}`);
        console.log(`  Country: ${femke.country}`);
        console.log(`  Total Points: ${femke.totalPoints}`);
        console.log(`  Best Time: ${femke.bestTime}`);
        console.log(`  Number of races: ${femke.races.length}`);
        console.log(`\n  Race details:`);
        femke.races.forEach((r, i) => {
            console.log(`    Race ${i + 1}: Rank ${r.rank}, Time ${r.time}, Points ${r.points}`);
        });
    } else {
        console.log('\nFemke not found in SOQC rankings!');

        // Search raw results
        console.log('\nSearching raw results for any Femke/Kok:');
        const allFemke = allResults.filter(r =>
            r.name.toLowerCase().includes('femke') ||
            r.name.toLowerCase().includes('kok')
        );
        console.log(`Found ${allFemke.length} results:`);
        allFemke.forEach(f => {
            console.log(`  ${f.name} (${f.country}) - ${f.time}, ${f.points} pts`);
        });
    }
})();
