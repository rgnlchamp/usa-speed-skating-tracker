const fs = require('fs');
const store = require('./src/data/store_pdf');

console.log('🔄 Regenerating public/data.json...\n');

(async () => {
    try {
        // Update data from PDFs and live sources
        await store.updateData();

        // Get the state
        const state = store.getState();

        // Save to public/data.json
        const outputPath = './public/data.json';
        fs.writeFileSync(outputPath, JSON.stringify(state, null, 2));

        console.log('\n✅ Data regenerated successfully!');
        console.log(`   File: ${outputPath}`);
        console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
        console.log(`   Events: ${state.events?.length || 0}`);
        console.log(`   SOQC Distances: ${Object.keys(state.soqc || {}).length}`);

        // Show Mass Start & Team Pursuit status
        console.log('\n📊 Mass Start & Team Pursuit Status:');
        ['Mass Start-men', 'Mass Start-women', 'Team Pursuit-men', 'Team Pursuit-women'].forEach(key => {
            const data = state.soqc[key];
            if (data) {
                console.log(`   ${key}: ${data.quotas.qualified.length} qualified`);
            } else {
                console.log(`   ${key}: ❌ MISSING`);
            }
        });

        console.log('\n✅ Done! Commit and push this file to deploy to Vercel.');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
