const fs = require('fs');
const path = require('path');
const store = require('./src/data/store_pdf');

(async () => {
    await store.updateData();
    const state = store.getState();

    // Parse Wiki Data
    const wikiText = fs.readFileSync(path.join(__dirname, 'wiki_data.txt'), 'utf8');
    const wikiLines = wikiText.split('\n');
    const wikiData = [];

    let currentDistance = '';
    let parsingTable = false;

    for (const line of wikiLines) {
        if (line.startsWith("Women's")) {
            currentDistance = line.trim();
            parsingTable = false;
            continue;
        }
        if (line.startsWith('Pos.')) {
            parsingTable = true;
            continue;
        }

        if (parsingTable && line.trim() !== '') {
            const parts = line.trim().split(/\t+/);
            if (parts.length >= 3) {
                const rank = parseInt(parts[0]);
                const nameCountry = parts[1];
                const time = parts[2];

                const nameMatch = nameCountry.match(/(.*)\s+\((.*)\)/);
                if (nameMatch) {
                    wikiData.push({
                        distance: currentDistance,
                        rank,
                        name: nameMatch[1].trim(),
                        country: nameMatch[2].trim(),
                        time
                    });
                }
            }
        }
    }

    const logStream = fs.createWriteStream('detailed_comparison.txt');
    function log(msg) {
        console.log(msg);
        logStream.write(msg + '\n');
    }

    log('=== DETAILED COMPARISON: Women\'s 500m ===\n');
    const wiki500 = wikiData.filter(d => d.distance === "Women's 500m");

    // Get ALL results from all events for women's 500m
    const allResults = [];
    if (state.events) {
        state.events.forEach(event => {
            if (event.races) {
                event.races.forEach(race => {
                    if (race.gender === 'women' && race.distance === '500m') {
                        race.results.forEach(result => {
                            allResults.push({
                                ...result,
                                eventName: event.title,
                                division: race.division
                            });
                        });
                    }
                });
            }
        });
    }

    log(`Total results in app: ${allResults.length}`);
    log(`Total Wiki entries: ${wiki500.length}\n`);

    // Create lookup by name
    const resultsByName = new Map();
    allResults.forEach(r => {
        const key = r.name.toLowerCase();
        if (!resultsByName.has(key)) {
            resultsByName.set(key, []);
        }
        resultsByName.get(key).push(r);
    });

    log('=== COMPARISON DETAILS ===\n');

    let matched = 0;
    let timeDiffs = 0;
    let missing = 0;

    wiki500.forEach(w => {
        const wikiName = w.name.toLowerCase();
        let found = false;

        for (const [appName, results] of resultsByName.entries()) {
            if (appName.includes(wikiName) || wikiName.includes(appName)) {
                found = true;
                matched++;

                // Find best time
                const bestResult = results.reduce((best, r) => {
                    const t = parseFloat(r.time.replace(':', ''));
                    const bt = parseFloat(best.time.replace(':', ''));
                    return t < bt ? r : best;
                });

                const wTime = parseFloat(w.time);
                const aTime = parseFloat(bestResult.time.replace(':', ''));
                const diff = Math.abs(wTime - aTime);

                if (diff > 0.05) {
                    timeDiffs++;
                    log(`[TIME DIFF] Rank ${w.rank} - ${w.name}`);
                    log(`  Wiki: ${w.time}`);
                    log(`  App:  ${bestResult.time} (${bestResult.eventName}, Div ${bestResult.division})`);
                    log(`  Diff: ${diff.toFixed(3)}s\n`);
                }
                break;
            }
        }

        if (!found) {
            missing++;
            log(`[MISSING] Rank ${w.rank} - ${w.name} (${w.country})`);
            log(`  Wiki time: ${w.time}\n`);
        }
    });

    log('\n=== SUMMARY ===');
    log(`Matched athletes: ${matched}`);
    log(`Time discrepancies: ${timeDiffs}`);
    log(`Missing in app: ${missing}`);
    log(`Total Wiki entries: ${wiki500.length}`);

    logStream.end();
})();
