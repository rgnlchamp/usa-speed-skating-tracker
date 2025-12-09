const fs = require('fs');
const path = require('path');
const store = require('./data/store_pdf');

async function generateData() {
    console.log('Starting build-time data generation...');

    if (process.env.VERCEL) {
        console.log('✨ Running on Vercel: Skipping data regeneration to use committed data.json');
        console.log('   (Puppeteer often fails in serverless build environments without specific config)');
        return;
    }

    try {
        // Trigger parsing and calculation
        await store.updateData();

        // Get the state
        const state = store.getState();

        // Define output path
        const outputPath = path.join(__dirname, '../public/data.json');

        // Write to file
        fs.writeFileSync(outputPath, JSON.stringify(state, null, 2));
        console.log(`✅ Successfully generated ${outputPath}`);
        console.log(`Total events: ${Object.keys(state.soqc).length}`);

    } catch (error) {
        console.error('❌ Error generating data:', error);
        process.exit(1);
    }
}

generateData();
