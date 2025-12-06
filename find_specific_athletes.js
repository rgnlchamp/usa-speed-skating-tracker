const fs = require('fs');
const path = require('path');
const { parsePDF } = require('./src/data/pdf_parser');

async function checkSpecificAthletes() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf') && f.toLowerCase().includes('men') && f.toLowerCase().includes('500'));

    console.log('Checking for: Merijn Scheperkamp, Stefan Westenbroek\n');

    for (const file of files) {
        const filePath = path.join(pdfDir, file);
        try {
            const raceData = await parsePDF(filePath);

            // Look for partial name matches
            const merijn = raceData.results.find(r =>
                r.name.toLowerCase().includes('merijn') ||
                r.name.toLowerCase().includes('scheperkamp')
            );

            const stefan = raceData.results.find(r =>
                r.name.toLowerCase().includes('stefan') && r.name.toLowerCase().includes('west')
            );

            if (merijn || stefan) {
                console.log(`\n=== ${file} ===`);
                console.log(`Division: ${raceData.division}`);
                console.log(`Total results: ${raceData.results.length}`);

                if (merijn) console.log(`MERIJN: ${JSON.stringify(merijn)}`);
                if (stefan) console.log(`STEFAN: ${JSON.stringify(stefan)}`);

                // Also show all NED skaters in this file
                const nedSkaters = raceData.results.filter(r => r.country === 'NED');
                console.log(`\nAll NED skaters (${nedSkaters.length}):`);
                nedSkaters.forEach(s => console.log(`  - ${s.name} (Rank ${s.rank})`));
            }
        } catch (error) {
            // Skip errors
        }
    }

    console.log('\n\n=== DONE ===');
}

checkSpecificAthletes();
