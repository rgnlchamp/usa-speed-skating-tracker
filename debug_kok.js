const { fetchEventDataFromPDFs } = require('./src/data/pdf_data_fetcher');
const { calculateSOQCPoints, calculateSOQCTimes } = require('./src/logic/qualification_rules_v2');

(async () => {
    console.log('=== Investigating Point Totals Issue ===\n');

    const races = await fetchEventDataFromPDFs();

    // Focus on women's 500m
    const w500mRaces = races.filter(r => r.distance === '500m' && r.gender === 'women');
    console.log(`Women's 500m - ${w500mRaces.length} races found:\n`);
    w500mRaces.forEach(r => {
        console.log(`  ${r.name} (Division ${r.division}): ${r.results.length} results`);
    });

    // Aggregate all results
    const allResults = [];
    w500mRaces.forEach(race => {
        allResults.push(...race.results);
    });

    console.log(`\nTotal results across all races: ${allResults.length}`);

    // Find all results for skaters with "Kok" in their name
    console.log('\n=== Searching for "Kok" ===');
    const kokResults = allResults.filter(r => r.name.toLowerCase().includes('kok'));

    if (kokResults.length > 0) {
        console.log(`Found ${kokResults.length} results with "Kok" in name:\n`);
        kokResults.forEach(r => {
            console.log(`  ${r.name} (${r.country}) - Time: ${r.time}, Points: ${r.points}`);
        });

        // Now calculate SOQC
        const soqcPoints = calculateSOQCPoints(allResults);
        const soqcTimes = calculateSOQCTimes(allResults);

        // Find Kok in the rankings
        console.log('\n=== Kok in SOQC Points Ranking ===');
        const kokInPoints = soqcPoints.find(s => s.name.toLowerCase().includes('kok'));
        if (kokInPoints) {
            const rank = soqcPoints.indexOf(kokInPoints) + 1;
            console.log(`Rank ${rank}: ${kokInPoints.name} (${kokInPoints.country})`);
            console.log(`  Total Points: ${kokInPoints.totalPoints}`);
            console.log(`  Best Time: ${kokInPoints.bestTime}`);
            console.log(`  Races: ${kokInPoints.races.length}`);
            kokInPoints.races.forEach(r => {
                console.log(`    - Time: ${r.time}, Points: ${r.points}`);
            });
        } else {
            console.log('Not found in points ranking');
        }

        console.log('\n=== Kok in SOQC Times Ranking ===');
        const kokInTimes = soqcTimes.find(s => s.name.toLowerCase().includes('kok'));
        if (kokInTimes) {
            const rank = soqcTimes.indexOf(kokInTimes) + 1;
            console.log(`Rank ${rank}: ${kokInTimes.name} (${kokInTimes.country})`);
            console.log(`  Best Time: ${kokInTimes.bestTime}`);
            console.log(`  Total Points: ${kokInTimes.totalPoints}`);
        }
    } else {
        console.log('No skaters found with "Kok" in name');
    }

    // Show top 10 by points
    console.log('\n=== Top 10 by Points ===');
    calculateSOQCPoints(allResults).slice(0, 10).forEach((s, i) => {
        console.log(`${i + 1}. ${s.name} (${s.country}) - ${s.totalPoints} pts (${s.races.length} races)`);
    });
})();
