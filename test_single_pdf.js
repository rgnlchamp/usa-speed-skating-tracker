const { parsePDF } = require('./src/data/pdf_parser');

(async () => {
    console.log('=== Testing single PDF ===\n');

    try {
        const result = await parsePDF('data/pdf/9_result_women_500_b_1-signed_20251115175152.pdf');

        console.log('Parse successful!');
        console.log(`Event: ${result.name}`);
        console.log(`Location: ${result.eventLocation}`);
        console.log(`Gender: ${result.gender}`);
        console.log(`Distance: ${result.distance}`);
        console.log(`Division: ${result.division}`);
        console.log(`Results count: ${result.results.length}`);

        console.log('\nFirst 10 results:');
        result.results.slice(0, 10).forEach(r => {
            console.log(`  ${r.rank}. ${r.name} (${r.country}) - ${r.time} [${r.points} pts]`);
        });

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
    }
})();
