const store = require('./src/data/store_pdf');
const { calculateSOQCPoints } = require('./src/logic/qualification_rules_v2');

async function checkYankunPoints() {
    await store.updateData();
    const state = store.getState();

    const results = [];
    ['WC1', 'WC2'].forEach(wc => {
        const race = state.raceResults[wc]?.find(r => r.distance === '1000m' && r.gender === 'men');
        if (race) results.push(...race.results);
    });

    const soqcPoints = calculateSOQCPoints(results);

    const yankun = soqcPoints.find(s => s.name.includes('Yankun'));

    console.log('--- Yankun Zhao Points Status ---');
    if (yankun) {
        const rank = soqcPoints.indexOf(yankun) + 1;
        console.log(`Rank: ${rank}`);
        console.log(`Points: ${yankun.totalPoints}`);
        console.log(`Best Time: ${yankun.bestTime}`);

        // Check if he is in top 21 (considering NOC limits)
        let qualifiedCount = 0;
        const nocCounts = {};
        let isQualified = false;

        for (const s of soqcPoints) {
            const count = nocCounts[s.country] || 0;
            if (count < 3) {
                qualifiedCount++;
                nocCounts[s.country] = count + 1;
                if (s.name === yankun.name) {
                    isQualified = true;
                    break;
                }
            }
            if (qualifiedCount >= 21) break;
        }

        console.log(`Qualifies by Points? ${isQualified}`);
    } else {
        console.log('Yankun not found');
    }
}

checkYankunPoints();
