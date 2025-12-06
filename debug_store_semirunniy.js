const { updateData, getState } = require('./src/data/store_pdf');

async function run() {
    console.log("Initializing data update...");
    await updateData();

    const state = getState();
    const menLongDistance = state.soqc['5000m-men']; // This is the Long Distance key

    if (!menLongDistance) {
        console.log("No 5000m-men data found.");
        return;
    }

    console.log("Searching for Semirunniy in 5000m-men points list...");
    const pointsList = menLongDistance.points;
    const skater = pointsList.find(p => p.name.includes('Semirunniy') || p.name.includes('Vladimir'));

    if (skater) {
        console.log(`Found Skater: ${skater.name}`);
        console.log(`Region: ${skater.country}`);
        console.log(`Total Points: ${skater.totalPoints}`);
        console.log('Races included in calculation:');
        if (skater.races) {
            skater.races.forEach(r => {
                console.log(`- ${r.distance} ${r.eventId || ''} (Rank: ${r.rank}, Points: ${r.points}, Time: ${r.time})`);
            });
        }
    } else {
        console.log("Semirunniy not found in points list.");
    }
}

run();
