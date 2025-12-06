const { fetchEventDataFromPDFs } = require('./src/data/pdf_data_fetcher');
const { calculateSOQCPoints, calculateSOQCTimes } = require('./src/logic/qualification_rules_v2');

(async () => {
    console.log('=== Diagnostic: Checking Gender Separation & Point Totals ===\n');

    const races = await fetchEventDataFromPDFs();

    // Group by distance-gender
    const byEvent = {};
    races.forEach(race => {
        const key = `${race.distance}-${race.gender}`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(...race.results);
    });

    console.log('Events found (separated by gender):');
    Object.keys(byEvent).sort().forEach(key => {
        console.log(`  ${key}: ${byEvent[key].length} results from ${races.filter(r => `${r.distance}-${r.gender}` === key).length} races`);
    });

    // Check Women's 500m specifically
    console.log('\n=== Women\'s 500m Detail ===');
    const w500mRaces = races.filter(r => r.distance === '500m' && r.gender === 'women');
    console.log(`Total races: ${w500mRaces.length}`);
    w500mRaces.forEach(r => {
        console.log(`  - ${r.name}: ${r.results.length} results`);
    });

    // Calculate points and check a specific skater
    const w500mResults = byEvent['500m-women'];
    const soqcPoints = calculateSOQCPoints(w500mResults);

    console.log('\nTop 5 by Points (Women\'s 500m):');
    soqcPoints.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.country}) - ${s.totalPoints} points from ${s.races.length} races`);
    });

    // Show gender separation for 500m
    console.log('\n=== Men\'s 500m Detail ===');
    const m500mRaces = races.filter(r => r.distance === '500m' && r.gender === 'men');
    console.log(`Total races: ${m500mRaces.length}`);
    m500mRaces.forEach(r => {
        console.log(`  - ${r.name}: ${r.results.length} results`);
    });

    const m500mResults = byEvent['500m-men'];
    const m500mPoints = calculateSOQCPoints(m500mResults);

    console.log('\nTop 5 by Points (Men\'s 500m):');
    m500mPoints.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.country}) - ${s.totalPoints} points from ${s.races.length} races`);
    });
})();
