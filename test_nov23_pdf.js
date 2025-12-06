const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

(async () => {
    const pdfPath = path.join(__dirname, 'data/pdf/23_result_women_500_a_2-1_20251123214024.pdf');

    console.log('\n=== PARSING NOVEMBER 23RD PDF ===\n');
    console.log(`File: ${path.basename(pdfPath)}\n`);

    try {
        const data = await parsePDF(pdfPath);

        console.log(`Event: ${data.name}`);
        console.log(`Distance: ${data.distance}`);
        console.log(`Gender: ${data.gender}`);
        console.log(`Division: ${data.division}`);
        console.log(`Total Results: ${data.results.length}\n`);

        // Find Jutta and Marrit
        const jutta = data.results.find(r => r.name.includes('LEERDAM'));
        const marrit = data.results.find(r => r.name.includes('FLEDDERUS'));

        if (jutta) {
            console.log(`✓ Jutta LEERDAM found:`);
            console.log(`   Rank: ${jutta.rank}`);
            console.log(`   Time: ${jutta.time}`);
            console.log(`   Points: ${jutta.points}\n`);
        } else {
            console.log(`✗ Jutta LEERDAM NOT FOUND\n`);
        }

        if (marrit) {
            console.log(`✓ Marrit FLEDDERUS found:`);
            console.log(`   Rank: ${marrit.rank}`);
            console.log(`   Time: ${marrit.time}`);
            console.log(`   Points: ${marrit.points}\n`);
        } else {
            console.log(`✗ Marrit FLEDDERUS NOT FOUND\n`);
        }

        // Show top 5
        console.log('Top 5 results from this race:');
        data.results.slice(0, 5).forEach((r, i) => {
            console.log(`${i + 1}. ${r.name.padEnd(25)} ${r.time} (${r.points} pts)`);
        });

    } catch (error) {
        console.error('Error parsing PDF:', error.message);
    }
})();
