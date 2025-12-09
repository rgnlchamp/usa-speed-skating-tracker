const store = require('./src/data/store_pdf');

async function verify() {
    console.log('=== Verifying Data Sources ===');

    // Check Mass Start Scraper
    console.log('\n--- Mass Start Check ---');
    try {
        const { scrapeMassStartStandings } = require('./src/data/mass_start_scraper');

        console.log('Testing Men\'s Mass Start Scraper...');
        const menMS = await scrapeMassStartStandings('M');
        console.log(`> Men Found: ${menMS.length}`);
        if (menMS.length > 0) console.log(`  Sample: ${menMS[0].name} (${menMS[0].country}) - ${menMS[0].totalPoints} pts`);

        console.log('Testing Women\'s Mass Start Scraper...');
        const womenMS = await scrapeMassStartStandings('F');
        console.log(`> Women Found: ${womenMS.length}`);
        if (womenMS.length > 0) console.log(`  Sample: ${womenMS[0].name} (${womenMS[0].country}) - ${womenMS[0].totalPoints} pts`);

    } catch (e) {
        console.error('Mass Start Verification Failed:', e);
    }

    // Check Team Pursuit PDF Parsing
    console.log('\n--- Team Pursuit Check ---');
    try {
        const { fetchEventDataFromPDFs } = require('./src/data/pdf_data_fetcher');
        console.log('Parsing all PDFs...');
        const races = await fetchEventDataFromPDFs();

        const tpRaces = races.filter(r => r.distance === 'Team Pursuit');
        console.log(`> Found ${tpRaces.length} Team Pursuit race entries in PDFs`);

        const menTP = tpRaces.filter(r => r.gender === 'men');
        const womenTP = tpRaces.filter(r => r.gender === 'women');

        console.log(`  > Men's Team Pursuit Races: ${menTP.length}`);
        console.log(`  > Women's Team Pursuit Races: ${womenTP.length}`);

        if (menTP.length > 0) {
            const sample = menTP[0];
            console.log(`  Sample Men's TP (${sample.eventLocation}): ${sample.results.length} teams`);
            if (sample.results.length > 0) console.log(`    Rank 1: ${sample.results[0].country} - ${sample.results[0].time} (${sample.results[0].points} pts)`);
        }

    } catch (e) {
        console.error('Team Pursuit Verification Failed:', e);
    }
}

verify();
