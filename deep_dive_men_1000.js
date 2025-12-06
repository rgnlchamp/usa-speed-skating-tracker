const store = require('./src/data/store_pdf');
const { calculateSOQCPoints, calculateSOQCTimes, allocateQuotas } = require('./src/logic/qualification_rules_v2');

async function deepDiveMen1000() {
    await store.updateData();
    const state = store.getState();

    // 1. Gather Results
    const results = [];
    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) results.push(...race.results);
    });

    // 2. Calculate Rankings
    const soqcPoints = calculateSOQCPoints(results);
    const soqcTimes = calculateSOQCTimes(results);

    // 3. Simulate Allocation
    // 1000m: 28 total (21 Points, 7 Times)
    const config = { total: 28, fromPoints: 21, fromTimes: 7, maxPerNOC: 3, reserve: 8 };

    const pointsQualifiers = [];
    const timesQualifiers = [];
    const qualifiedKeys = new Set();
    const nocCounts = {};

    function canQualify(skater) {
        const key = `${skater.name}|${skater.country}`;
        if (qualifiedKeys.has(key)) return false;
        const currentCount = nocCounts[skater.country] || 0;
        return currentCount < config.maxPerNOC;
    }

    function add(skater, list, method) {
        const key = `${skater.name}|${skater.country}`;
        qualifiedKeys.add(key);
        nocCounts[skater.country] = (nocCounts[skater.country] || 0) + 1;
        list.push({ ...skater, method });
    }

    console.log('--- Points Allocation (Top 21) ---');
    for (const skater of soqcPoints) {
        if (pointsQualifiers.length >= config.fromPoints) break;
        if (canQualify(skater)) {
            add(skater, pointsQualifiers, 'Points');
            console.log(`${pointsQualifiers.length}. ${skater.name} (${skater.country}) Pts:${skater.totalPoints}`);
        } else {
            console.log(`SKIP (Quota Full): ${skater.name} (${skater.country})`);
        }
    }

    console.log('\n--- Times Allocation (Top 7) ---');
    for (const skater of soqcTimes) {
        if (timesQualifiers.length >= config.fromTimes) break;

        const key = `${skater.name}|${skater.country}`;
        const isQualified = qualifiedKeys.has(key);
        const count = nocCounts[skater.country] || 0;
        const quotaFull = count >= config.maxPerNOC;

        if (canQualify(skater)) {
            add(skater, timesQualifiers, 'Times');
            console.log(`${timesQualifiers.length}. ${skater.name} (${skater.country}) Time:${skater.bestTime}`);
        } else if (isQualified) {
            // console.log(`SKIP (Already Qualified): ${skater.name}`);
        } else if (quotaFull) {
            console.log(`SKIP (Quota Full): ${skater.name} (${skater.country}) Count:${count}`);
        } else {
            console.log(`SKIP (Unknown): ${skater.name}`);
        }
    }

    console.log('\n--- Yankun Zhao Status ---');
    const yankun = soqcPoints.find(s => s.name.includes('Yankun'));
    if (yankun) {
        console.log(`Points Rank: ${soqcPoints.indexOf(yankun) + 1} (Pts: ${yankun.totalPoints})`);
        const yankunTime = soqcTimes.find(s => s.name.includes('Yankun'));
        console.log(`Times Rank: ${soqcTimes.indexOf(yankunTime) + 1} (Time: ${yankunTime.bestTime})`);

        const isQual = qualifiedKeys.has(`${yankun.name}|${yankun.country}`);
        console.log(`Qualified? ${isQual}`);
    } else {
        console.log('Yankun Zhao not found in data.');
    }

    console.log('\n--- Cut-off Analysis ---');
    if (timesQualifiers.length > 0) {
        const last = timesQualifiers[timesQualifiers.length - 1];
        console.log(`Last Time Qualifier: ${last.name} (${last.country}) Time: ${last.bestTime}`);
    }
}

deepDiveMen1000();
