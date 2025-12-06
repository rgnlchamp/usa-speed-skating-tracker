const store = require('./src/data/store_pdf');

async function analyzeNedMen500() {
    await store.updateData();
    const state = store.getState();

    const men500 = state.soqc['500m-men'];
    if (!men500) {
        console.log('No data for 500m-men');
        return;
    }

    console.log('--- All NED Skaters in 500m Men (App Data) ---');
    // We need to look at the raw race results to see everyone, not just qualified
    // But store.js aggregates them. Let's look at the 'points' list in soqc calculation if accessible, 
    // or just look at the qualified list and try to find the missing ones in the raw results.

    // Let's look at the `raceResults` for WC1 and WC2 500m Men to see raw points.
    const wc1 = state.raceResults['WC1'].find(r => r.distance === '500m' && r.gender === 'men');
    const wc2 = state.raceResults['WC2']?.find(r => r.distance === '500m' && r.gender === 'men');

    const nedSkaters = new Map();

    function addSkater(source, results) {
        results.forEach(r => {
            if (r.country === 'NED') {
                if (!nedSkaters.has(r.name)) {
                    nedSkaters.set(r.name, { name: r.name, wc1: 0, wc2: 0, total: 0 });
                }
                const s = nedSkaters.get(r.name);
                s[source] = r.points || 0;
                s.total = s.wc1 + s.wc2;
            }
        });
    }

    if (wc1) addSkater('wc1', wc1.results);
    if (wc2) addSkater('wc2', wc2.results);

    console.log('Name | WC1 | WC2 | Total');
    Array.from(nedSkaters.values())
        .sort((a, b) => b.total - a.total)
        .forEach(s => {
            console.log(`${s.name} | ${s.wc1} | ${s.wc2} | ${s.total}`);
        });

    console.log('\n--- Qualified in App ---');
    men500.quotas.qualified
        .filter(q => q.country === 'NED')
        .forEach(q => console.log(`${q.rank} ${q.name} (${q.method})`));
}

analyzeNedMen500();
