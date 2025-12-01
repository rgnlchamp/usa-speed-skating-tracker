const { parseAllPDFs } = require('./src/data/pdf_parser');
const path = require('path');

(async () => {
    console.log('=== Debugging Men\'s 500m Parsing ===');
    const pdfDir = path.join(__dirname, 'data/pdf');
    const races = await parseAllPDFs(pdfDir);

    // Filter for Men's 500m
    const men500 = races.filter(r => r.distance === '500m' && r.gender === 'men');

    let totalResults = 0;
    men500.forEach(race => {
        console.log(`\n${race.name}: ${race.results.length} results`);
        totalResults += race.results.length;

        // Check for missing times or points
        const missingTime = race.results.filter(r => !r.time);
        if (missingTime.length > 0) {
            console.log(`  WARNING: ${missingTime.length} results missing time!`);
            missingTime.forEach(r => console.log(`    Rank ${r.rank}: ${r.name} (${r.country})`));
        }

        // Print a few results to check format
        console.log('  First 3 results:');
        race.results.slice(0, 3).forEach(r => {
            console.log(`    ${r.rank}. ${r.name} (${r.country}) - ${r.time} [${r.points}]`);
        });
    });

    console.log(`\nTotal Men's 500m results: ${totalResults}`);
})();
