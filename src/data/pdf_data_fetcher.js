const path = require('path');
const pdfParser = require('./pdf_parser');

/**
 * Fetch event data from PDF files instead of web scraping
 * @param {string} pdfDirectory - Path to directory containing PDF files (default: '../../data/pdf')
 * @returns {Promise<Array>} Array of race data compatible with qualification_rules_v2
 */
async function fetchEventDataFromPDFs(pdfDirectory = null) {
    // Use process.cwd() for Vercel compatibility
    const pdfDir = pdfDirectory || path.join(process.cwd(), 'data', 'pdf');

    console.log(`Loading PDF data from: ${pdfDir}...`);

    // Parse all PDFs in the directory
    if (!pdfParser || typeof pdfParser.parseAllPDFs !== 'function') {
        console.error('Error: pdfParser.parseAllPDFs is not a function');
        console.error('pdfParser exports:', pdfParser);
        throw new Error('pdfParser.parseAllPDFs is not a function');
    }

    const races = await pdfParser.parseAllPDFs(pdfDir);

    // Transform to match the format expected by qualification_rules_v2
    // Expected format: { distance, gender, results: [...] }
    const formattedRaces = races.map(race => ({
        eventNumber: race.eventNumber,
        eventLocation: race.eventLocation,
        eventDate: race.eventDate,
        distance: race.distance,
        gender: race.gender,
        division: race.division,
        name: race.name,
        url: `PDF: ${race.eventLocation}`,
        results: race.results
    }));

    return formattedRaces;
}

// Test if run directly
if (require.main === module) {
    (async () => {
        console.log('=== Testing PDF Data Fetcher ===\n');

        const races = await fetchEventDataFromPDFs();

        console.log(`\n=== Summary ===`);
        console.log(`Total races: ${races.length}`);

        // Group by event
        const byEvent = {};
        races.forEach(race => {
            const key = `${race.distance}-${race.gender}`;
            if (!byEvent[key]) byEvent[key] = [];
            byEvent[key].push(race);
        });

        console.log('\nBy Event:');
        Object.entries(byEvent).forEach(([key, raceList]) => {
            const totalResults = raceList.reduce((sum, r) => sum + r.results.length, 0);
            console.log(`  ${key}: ${raceList.length} races, ${totalResults} total results`);
        });
    })();
}

module.exports = { fetchEventDataFromPDFs };
