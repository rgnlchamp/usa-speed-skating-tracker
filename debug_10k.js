const { updateData, getState } = require('./src/data/store_pdf');

async function run() {
    await updateData();
    const state = getState();

    // Check 10000m-men SOQC
    const tenK = state.soqc['10000m-men'];
    if (!tenK) {
        console.log("No 10000m-men data");
        return;
    }

    console.log("\n=== 10000m Men Points List ===");
    const vlad = tenK.points.find(p => p.name.toLowerCase().includes('semir'));
    if (vlad) {
        console.log(`Found: ${vlad.name} (${vlad.country})`);
        console.log(`Total Points: ${vlad.totalPoints}`);
        console.log(`Races:`);
        if (vlad.races) {
            vlad.races.forEach(r => {
                console.log(`  - ${r.distance} ${r.eventId} (Rank: ${r.rank}, Points: ${r.points})`);
            });
        }
    } else {
        console.log("NOT FOUND in 10000m-men points list");
        console.log("\nSearching all entries for 'semir':");
        tenK.points.forEach((p, i) => {
            if (p.name.toLowerCase().includes('semir') || p.name.toLowerCase().includes('vladimir')) {
                console.log(`  [${i}] ${p.name} - ${p.totalPoints} pts`);
            }
        });
    }
}

run();
