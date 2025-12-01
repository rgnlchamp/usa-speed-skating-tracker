const store = require('./src/data/store_pdf');
const fs = require('fs');
const path = require('path');

async function generateStaticData() {
    console.log('Parsing PDFs and generating static data...');

    await store.updateData();
    const state = store.getState();

    // Save the state as JSON
    const dataPath = path.join(__dirname, 'public', 'data.json');
    fs.writeFileSync(dataPath, JSON.stringify(state, null, 2));

    console.log('✅ Static data generated at public/data.json');
    console.log(`   - ${Object.keys(state.soqc).length} events`);
    console.log(`   - Ready for deployment`);
}

generateStaticData();
