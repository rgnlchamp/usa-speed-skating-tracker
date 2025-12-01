const store = require('./src/data/store_pdf');
const { parseAllPDFs } = require('./src/data/pdf_parser');
const path = require('path');

async function investigateMen1000() {
    await store.updateData();
    const state = store.getState();
    const men1000 = state.soqc['1000m-men'];

    // 1. Check Cut-off Time
    const timesQualifiers = men1000.quotas.qualified.filter(q => q.method === 'Times');
    if (timesQualifiers.length > 0) {
        const lastQualifier = timesQualifiers[timesQualifiers.length - 1];
        console.log(`Last Time Qualifier: ${lastQualifier.name} (${lastQualifier.country}) Time: ${lastQualifier.time}`);
    } else {
        console.log('No Time Qualifiers found.');
    }

    // 2. Check Yankun's Time in App
    const yankun = men1000.quotas.qualified.find(q => q.name.includes('Yankun'));
    if (yankun) {
        console.log(`Yankun in App: ${yankun.name} Time: ${yankun.time}`);
    } else {
        // Check reserve
        const yankunRes = men1000.quotas.reserve.find(q => q.name.includes('Yankun'));
        console.log(`Yankun in Reserve: ${yankunRes ? yankunRes.time : 'Not found'}`);
    }

    // 3. Search for 1:08.22 in raw PDF data
    const pdfDir = path.join(__dirname, 'data/pdf');
    const races = await parseAllPDFs(pdfDir);

    let foundTime = false;
    races.forEach(race => {
        if (race.gender === 'men' && race.distance === '1000m') {
            const match = race.results.find(r => r.time === '1:08.22');
            if (match) {
                console.log(`FOUND 1:08.22: ${match.name} in ${race.name} (${race.eventLocation})`);
                foundTime = true;
            }
        }
    });

    if (!foundTime) {
        console.log('Time 1:08.22 NOT FOUND in any Men 1000m file.');
    }
}

investigateMen1000();
