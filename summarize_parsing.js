const store = require('./src/data/store_pdf');

async function summarizeParsingResults() {
    await store.updateData();
    const state = store.getState();

    console.log('=== MEN 500M PARSING SUMMARY ===\n');

    // Get all Men 500m results
    const allResults = [];
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '500m' && r.gender === 'men');
        if (races) {
            console.log(`${wc} Men 500m races: ${races.length}`);
            races.forEach(race => {
                console.log(`  - Division ${race.division}: ${race.results.length} skaters`);
                allResults.push(...race.results.map(r => ({ ...r, wc, division: race.division })));
            });
        }
    });

    console.log(`\nTotal unique skaters in Men 500m: ${new Set(allResults.map(r => `${r.name}|${r.country}`)).size}`);
    console.log(`Total race entries: ${allResults.length}\n`);

    // Count by country
    const byCountry = {};
    allResults.forEach(r => {
        if (!byCountry[r.country]) byCountry[r.country] = new Set();
        byCountry[r.country].add(r.name);
    });

    console.log('Skaters by country:');
    Object.entries(byCountry)
        .sort((a, b) => b[1].size - a[1].size)
        .forEach(([country, names]) => {
            console.log(`  ${country}: ${names.size}`);
        });

    // Show specific missing athletes we know about from Excel
    console.log('\n=== CHECKING SPECIFIC ATHLETES FROM EXCEL ===');
    const checkList = [
        'Tatsuya Shinhama',
        'Katsuhiro Kuratsubo',
        'Yan kun Zhao', // Note: might be "Yankun" or "Yan kun"
        'Sanghyeok Cho'
    ];

    checkList.forEach(name => {
        const found = allResults.find(r => {
            const nameLower = r.name.toLowerCase();
            const searchLower = name.toLowerCase();
            return nameLower.includes(searchLower) || searchLower.includes(nameLower);
        });

        if (found) {
            console.log(`✓ ${name}: Found as "${found.name}" (${found.country}) WC${found.wc} Div${found.division}`);
        } else {
            // Try partial match
            const lastName = name.split(' ').pop();
            const partial = allResults.find(r => r.name.toLowerCase().includes(lastName.toLowerCase()));
            if (partial) {
                console.log(`≈ ${name}: Partial match "${partial.name}" (${partial.country})`);
            } else {
                console.log(`✗ ${name}: NOT FOUND`);
            }
        }
    });
}

summarizeParsingResults();
