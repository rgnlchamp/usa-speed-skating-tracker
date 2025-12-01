const { parseAllPDFs } = require('./src/data/pdf_parser');
const { calculateSOQCPoints, calculateSOQCTimes, allocateQuotas, EVENT_CONFIG } = require('./src/logic/qualification_rules_v2');
const path = require('path');

(async () => {
    console.log('=== Debugging Men\'s 500m SOQC ===');
    const pdfDir = path.join(__dirname, 'data/pdf');
    const races = await parseAllPDFs(pdfDir);

    // Filter for Men's 500m
    const men500Races = races.filter(r => r.distance === '500m' && r.gender === 'men');

    // Aggregate results
    const allResults = [];
    men500Races.forEach(race => {
        allResults.push(...race.results);
    });

    console.log(`Total results: ${allResults.length}`);

    // Calculate Rankings
    const pointsRanking = calculateSOQCPoints(allResults);
    const timesRanking = calculateSOQCTimes(allResults);

    console.log(`Points Ranking size: ${pointsRanking.length}`);
    console.log(`Times Ranking size: ${timesRanking.length}`);

    // Check Times Ranking top 5
    console.log('\nTop 5 Times:');
    timesRanking.slice(0, 5).forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.name} (${s.country}) - ${s.bestTime}`);
    });

    // Allocate Quotas
    const eventKey = '500m'; // Men's 500m
    const quotas = allocateQuotas(eventKey, pointsRanking, timesRanking);

    console.log(`\nQuotas:`);
    console.log(`  Points Qualifiers: ${quotas.pointsQualifiers.length}`);
    console.log(`  Times Qualifiers: ${quotas.timesQualifiers.length}`);
    console.log(`  Total: ${quotas.pointsQualifiers.length + quotas.timesQualifiers.length}`);

    if (quotas.timesQualifiers.length < 7) {
        console.log('\nWhy so few Times Qualifiers?');
        console.log('Checking candidates from Times Ranking:');

        let qualifiedCount = 0;
        const qualifiedKeys = new Set(quotas.pointsQualifiers.map(s => `${s.name}|${s.country}`));
        const nocCounts = { ...quotas.nocCounts }; // Copy from points allocation state? 
        // Wait, allocateQuotas returns final nocCounts.
        // But to debug, I need to simulate the loop.

        // Let's just print the first 20 from Times Ranking and their status
        timesRanking.forEach((s, i) => {
            if (i >= 30) return;
            const key = `${s.name}|${s.country}`;
            const isPointsQualified = qualifiedKeys.has(key);
            const currentNocCount = quotas.nocCounts[s.country] || 0; // This is FINAL count.
            // This logic is tricky to debug post-hoc.

            // Let's look at the output first.
        });
    }
})();
