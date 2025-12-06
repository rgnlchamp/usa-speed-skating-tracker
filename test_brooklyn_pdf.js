const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

(async () => {
    // Test the specific file where Brooklyn had "Ou t" issue
    // Based on previous logs, it was likely Division B Race 1 or 3
    // Let's check 9_result_women_500_b_1-signed_20251115175152.pdf

    const pdfPath = path.join(__dirname, 'data/pdf/9_result_women_500_b_1-signed_20251115175152.pdf');
    console.log(`Testing parser on: ${path.basename(pdfPath)}`);

    try {
        const data = await parsePDF(pdfPath);
        console.log(`Parsed ${data.results.length} results.`);

        // Find Brooklyn
        const brooklyn = data.results.find(r => r.name.includes('Brooklyn'));
        if (brooklyn) {
            console.log('Found Brooklyn:', JSON.stringify(brooklyn, null, 2));
        } else {
            console.log('Brooklyn NOT found!');
            // Print all results to see what happened
            console.log('All results:');
            data.results.forEach(r => console.log(`  ${r.rank}. ${r.name} (${r.country})`));
        }

    } catch (e) {
        console.error(e);
    }
})();
