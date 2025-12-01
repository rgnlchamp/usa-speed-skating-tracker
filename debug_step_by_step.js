const pdfDataFetcher = require('./src/data/pdf_data_fetcher');
const qualificationRules = require('./src/logic/qualification_rules_v2');

async function run() {
    console.log('1. Fetching PDF Data...');
    let rawData;
    try {
        rawData = await pdfDataFetcher.getAllData();
        console.log(`   Fetched ${Object.keys(rawData).length} events.`);
    } catch (e) {
        console.error('   FAILED fetching data:', e);
        return;
    }

    console.log('2. Calculating SOQC...');
    try {
        const soqcData = qualificationRules.calculateSOQC(rawData);
        console.log(`   Calculated SOQC for ${Object.keys(soqcData).length} events.`);
    } catch (e) {
        console.error('   FAILED calculating SOQC:', e);
        console.error(e.stack);
        return;
    }

    console.log('3. Done.');
}

run();
