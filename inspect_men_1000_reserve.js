const store = require('./src/data/store_pdf');

async function inspectMen1000Reserve() {
    await store.updateData();
    const state = store.getState();

    const men1000 = state.soqc['1000m-men'];
    if (!men1000) {
        console.log('No data for 1000m-men');
        return;
    }

    console.log('--- Qualified Skaters (Men 1000m) ---');
    men1000.quotas.qualified.forEach(q => {
        console.log(`${q.rank} ${q.name} (${q.country}) [${q.method}] Pts:${q.points} Time:${q.time}`);
    });

    console.log('\n--- Reserve List (App) ---');
    men1000.quotas.reserve.forEach(q => {
        console.log(`${q.rank} ${q.name} (${q.country}) Pts:${q.points} Time:${q.time}`);
    });

    // We want to see where Yankun Zhao and Nil Llop Izquierdo stand
    // We need to find them in the raw results if they are not in the lists above
    // (Note: Nil is in App Reserve, Yankun is in Official Reserve)

    // Let's search for them in the race results to see their stats
    const wc1 = state.raceResults['WC1'].find(r => r.distance === '1000m' && r.gender === 'men');
    const wc2 = state.raceResults['WC2']?.find(r => r.distance === '1000m' && r.gender === 'men');

    const skaters = {};
    function add(results) {
        results.forEach(r => {
            if (!skaters[r.name]) skaters[r.name] = { name: r.name, country: r.country, points: 0, time: '9:59.99' };
            skaters[r.name].points += (r.points || 0);
            if (r.time && r.time < skaters[r.name].time) skaters[r.name].time = r.time;
        });
    }
    if (wc1) add(wc1.results);
    if (wc2) add(wc2.results);

    console.log('\n--- Specific Skater Stats ---');
    ['Yankun ZHAO', 'Nil LLOP IZQUIERDO', 'Alessio TRENTINI', 'Valentin THIEBAULT'].forEach(name => {
        // Fuzzy find
        const key = Object.keys(skaters).find(k => k.toLowerCase().includes(name.split(' ')[0].toLowerCase()) && k.toLowerCase().includes(name.split(' ')[1].toLowerCase()));
        if (key) {
            const s = skaters[key];
            console.log(`${s.name} (${s.country}): Points=${s.points}, Best Time=${s.time}`);
        } else {
            console.log(`${name}: Not found in raw results`);
        }
    });
}

inspectMen1000Reserve();
