const http = require('http');

// Sample from user's Wikipedia data
const wikiSample = [
    { rank: 1, name: 'Femke Kok', country: 'NED', bestTime: 36.097 },
    { rank: 2, name: 'Erin Jackson', country: 'USA', bestTime: 36.572 },
    { rank: 3, name: 'Yukino Yoshida', country: 'JPN', bestTime: 36.885 },
    { rank: 4, name: 'Jutta Leerdam', country: 'NED', bestTime: 37.012 },
    { rank: 5, name: 'Lee Na-hyun', country: 'KOR', bestTime: 37.030 },
    { rank: 6, name: 'Marrit Fledderus', country: 'NED', bestTime: 37.084 },
    { rank: 21, name: 'Brooklyn McDougall', country: 'CAN', bestTime: 37.672 }
];

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);
        const women500 = appData.soqc['500m-women'];

        console.log('\n=== WIKIPEDIA vs APPLICATION COMPARISON ===\n');
        console.log('Event: Women\'s 500m\n');

        // Create lookup
        const appLookup = {};
        women500.times.forEach(athlete => {
            const key = athlete.name.toLowerCase().replace(/\s+/g, ' ').trim();
            appLookup[key] = athlete;
        });

        console.log('Rank | Skater                  | Wiki Time | App Time  | Diff    | Status');
        console.log('-----|-------------------------|-----------|-----------|---------|--------');

        let matches = 0;
        let diffs = 0;
        let missing = 0;

        wikiSample.forEach(wiki => {
            const searchName = wiki.name.toLowerCase().replace(/\s+/g, ' ').trim();
            let appEntry = appLookup[searchName];

            // Fuzzy match
            if (!appEntry) {
                for (const [key, value] of Object.entries(appLookup)) {
                    if (key.includes(searchName) || searchName.includes(key)) {
                        appEntry = value;
                        break;
                    }
                }
            }

            const nameFormatted = wiki.name.padEnd(23);

            if (appEntry) {
                const appTime = parseFloat(appEntry.bestTime.replace(':', ''));
                const diff = Math.abs(wiki.bestTime - appTime);

                if (diff < 0.01) {
                    console.log(`${wiki.rank.toString().padStart(4)} | ${nameFormatted} | ${wiki.bestTime.toString().padStart(9)} | ${appEntry.bestTime.padStart(9)} | ${diff.toFixed(3).padStart(7)} | ✓ MATCH`);
                    matches++;
                } else {
                    console.log(`${wiki.rank.toString().padStart(4)} | ${nameFormatted} | ${wiki.bestTime.toString().padStart(9)} | ${appEntry.bestTime.padStart(9)} | ${diff.toFixed(3).padStart(7)} | ⚠ DIFF`);
                    diffs++;
                }
            } else {
                console.log(`${wiki.rank.toString().padStart(4)} | ${nameFormatted} | ${wiki.bestTime.toString().padStart(9)} | N/A       | N/A     | ✗ MISSING`);
                missing++;
            }
        });

        console.log('\n=== SUMMARY ===');
        console.log(`Exact matches:    ${matches}`);
        console.log(`Time differences: ${diffs}`);
        console.log(`Not found:        ${missing}`);
        console.log(`Total checked:    ${wikiSample.length}`);
    });
});
