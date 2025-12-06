const { fetchEventData } = require('./src/data/data_fetcher_v2');
const { calculateSOQCPoints, calculateSOQCTimes, allocateQuotas } = require('./src/logic/qualification_rules_v2');

(async () => {
    console.log("=== INTEGRATION TEST: v2 Modules ===\n");

    // Fetch data
    console.log("1. Fetching data from speedskatingresults.com...");
    const races = await fetchEventData('30774');

    // Group by distance and gender
    const byEvent = {};
    races.forEach(race => {
        const key = `${race.distance}-${race.gender}`;
        if (!byEvent[key]) byEvent[key] = [];
        byEvent[key].push(...race.results);
    });

    console.log(`\n2. Found ${Object.keys(byEvent).length} unique events:\n`);
    Object.keys(byEvent).forEach(key => {
        console.log(`   ${key}: ${byEvent[key].length} results`);
    });

    //Test with Women's 500m
    console.log("\n3. Testing qualification logic with Women's 500m...\n");
    const w500m = byEvent['500m-women'];

    if (w500m && w500m.length > 0) {
        const soqcPoints = calculateSOQCPoints(w500m);
        const soqcTimes = calculateSOQCTimes(w500m);
        const quotas = allocateQuotas('500m', soqcPoints, soqcTimes);

        console.log(`SOQC Points - Top 5:`);
        soqcPoints.slice(0, 5).forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} (${s.country}) - ${s.totalPoints} pts, best: ${s.bestTime}`);
        });

        console.log(`\nSOQC Times - Top 5:`);
        soqcTimes.slice(0, 5).forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} (${s.country}) - ${s.bestTime}, ${s.totalPoints} pts`);
        });

        console.log(`\n=== QUOTA ALLOCATION ===`);
        console.log(`Config: ${quotas.config.fromPoints} from points + ${quotas.config.fromTimes} from times = ${quotas.config.total} total`);
        console.log(`\nPoints Qualifiers (${quotas.pointsQualifiers.length}):`);
        quotas.pointsQualifiers.slice(0, 10).forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} (${s.country})`);
        });

        console.log(`\nTimes Qualifiers (${quotas.timesQualifiers.length}):`);
        quotas.timesQualifiers.forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} (${s.country})`);
        });

        console.log(`\nReserve List (${quotas.reserve.length}):`);
        quotas.reserve.slice(0, 5).forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.name} (${s.country})`);
        });

        console.log(`\nNOC Counts:`);
        Object.entries(quotas.nocCounts).slice(0, 10).forEach(([noc, count]) => {
            console.log(`   ${noc}: ${count}`);
        });

        // Check for USA
        const usaPoints = quotas.pointsQualifiers.filter(s => s.country === 'USA');
        const usaTimes = quotas.timesQualifiers.filter(s => s.country === 'USA');
        console.log(`\n✓ USA Quotas in W500m: ${usaPoints.length + usaTimes.length} (${usaPoints.length} points, ${usaTimes.length} times)`);
    }

    console.log("\n=== TEST COMPLETE ===");
})();
