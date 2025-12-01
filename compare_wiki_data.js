const fs = require('fs');
const path = require('path');
const store = require('./src/data/store_pdf');

(async () => {
    // Load PDF data into store
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
            // Parse line: "21\t Brooklyn McDougall (CAN)\t37.672\tQ"
            const parts = line.trim().split(/\t+/);
            if (parts.length >= 3) {
                const rank = parseInt(parts[0]);
                const nameCountry = parts[1];
                const time = parts[2];

                // Extract name and country
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

    const logStream = fs.createWriteStream('comparison_output.txt');
    function log(msg) {
        console.log(msg);
        logStream.write(msg + '\n');
    }

    log('=== Comparison: Women\'s 500m ===');
    const wiki500 = wikiData.filter(d => d.distance === "Women's 500m");

    // Create a map of our data for easy lookup
    const appMap = new Map();
    if (state.soqc['500m-women'] && state.soqc['500m-women'].times) {
        state.soqc['500m-women'].times.forEach(r => {
            appMap.set(r.name.toLowerCase(), r);
        });
    }

    if (state.soqc['500m-women'] && state.soqc['500m-women'].points) {
        state.soqc['500m-women'].points.forEach(r => {
            if (!appMap.has(r.name.toLowerCase())) {
                appMap.set(r.name.toLowerCase(), { ...r, source: 'points' });
            }
        });
    }

    let discrepancies = 0;

    wiki500.forEach(w => {
        // Fuzzy name match
        let appEntry = null;
        for (const [name, data] of appMap.entries()) {
            if (name.includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(name)) {
                appEntry = data;
                break;
            }
            // Handle "Last First" vs "First Last"
            const wParts = w.name.toLowerCase().split(' ');
            const aParts = name.split(' ');
            if (wParts.length > 1 && aParts.length > 1) {
                if (wParts[0] === aParts[1] && wParts[1] === aParts[0]) {
                    appEntry = data;
                    break;
                }
            }
        }

        if (appEntry) {
            // Compare Time
            // Wiki time might be more precise (3 decimals) vs our 2 decimals
            const wTime = parseFloat(w.time);
            const aTime = parseFloat(appEntry.bestTime.replace(':', ''));

            const diff = Math.abs(wTime - aTime);
            if (diff > 0.05) { // Allow small diff due to rounding
                log(`[DIFF] Rank ${w.rank} ${w.name}: Wiki=${w.time}, App=${appEntry.bestTime}`);
                discrepancies++;
            } else {
                // log(`[OK] Rank ${w.rank} ${w.name}`);
            }
        } else {
            log(`[MISSING] Rank ${w.rank} ${w.name} (${w.country}) not found in App data.`);
            discrepancies++;
        }
    });

    if (discrepancies === 0) {
        log('No significant discrepancies found!');
    } else {
        log(`Found ${discrepancies} discrepancies.`);
    }
    logStream.end();

})();
