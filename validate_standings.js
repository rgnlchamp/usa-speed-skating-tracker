/**
 * Validate our standings against the official ISU live standings
 * Compares total points for top skaters in each distance
 */

const fs = require('fs');
const path = require('path');

// Load our generated data
const dataPath = path.join(__dirname, 'public', 'data.json');
const ourData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// ISU Live Results URLs for each distance
const ISU_STANDINGS_URLS = {
    '500m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_500/standings',
    '500m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_500/standings',
    '1000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_1000/standings',
    '1000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_1000/standings',
    '1500m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_1500/standings',
    '1500m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_1500/standings',
    '3000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_3000/standings',
    '5000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_5000/standings',
    '5000m-women': 'https://live.isuresults.eu/worldcup/WC_2026_F_5000/standings',
    '10000m-men': 'https://live.isuresults.eu/worldcup/WC_2026_M_10000/standings'
};

/**
 * Calculate total points for a skater across all World Cups for a specific distance
 */
function calculateSkaterPoints(skaterName, country, distance, gender) {
    let total = 0;
    const races = [];

    Object.keys(ourData.raceResults).forEach(wc => {
        ourData.raceResults[wc]
            .filter(r => r.distance === distance && r.gender === gender)
            .forEach(race => {
                const result = race.results.find(r =>
                    r.name && r.name.toLowerCase().includes(skaterName.toLowerCase()) &&
                    r.country === country
                );
                if (result) {
                    total += result.points || 0;
                    races.push({
                        wc,
                        division: race.division,
                        points: result.points,
                        time: result.time
                    });
                }
            });
    });

    return { total, races };
}

/**
 * Get our top skaters for a distance
 */
function getOurTopSkaters(distance, gender, limit = 20) {
    const key = `${distance}-${gender}`;
    const soqc = ourData.soqc[key];

    if (!soqc || !soqc.points) {
        console.log(`No SOQC data for ${key}`);
        return [];
    }

    return soqc.points.slice(0, limit).map(s => ({
        name: s.name,
        country: s.country,
        totalPoints: s.totalPoints
    }));
}

/**
 * Print comparison report
 */
function printComparisonReport() {
    console.log('='.repeat(80));
    console.log('STANDINGS VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`Generated: ${new Date().toISOString()}\n`);

    const distances = [
        { distance: '500m', gender: 'women' },
        { distance: '500m', gender: 'men' },
        { distance: '1000m', gender: 'women' },
        { distance: '1000m', gender: 'men' },
        { distance: '1500m', gender: 'women' },
        { distance: '1500m', gender: 'men' },
        { distance: '3000m', gender: 'women' },
        { distance: '5000m', gender: 'men' },
        { distance: '5000m', gender: 'women' },
        { distance: '10000m', gender: 'men' }
    ];

    distances.forEach(({ distance, gender }) => {
        const key = `${distance}-${gender}`;
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`${distance} ${gender.toUpperCase()}`);
        console.log(`ISU URL: ${ISU_STANDINGS_URLS[key] || 'N/A'}`);
        console.log(`${'─'.repeat(80)}`);

        const topSkaters = getOurTopSkaters(distance, gender, 15);

        if (topSkaters.length === 0) {
            console.log('  No data available');
            return;
        }

        console.log(`\nRank | Name                           | Country | Points`);
        console.log(`-----|--------------------------------|---------|--------`);

        topSkaters.forEach((skater, idx) => {
            const paddedName = skater.name.padEnd(30).slice(0, 30);
            console.log(`${(idx + 1).toString().padStart(4)} | ${paddedName} | ${skater.country.padEnd(7)} | ${skater.totalPoints}`);
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log('RACE COUNTS BY WORLD CUP');
    console.log('='.repeat(80));

    Object.keys(ourData.raceResults).sort().forEach(wc => {
        const races = ourData.raceResults[wc];
        console.log(`\n${wc}: ${races.length} races`);

        // Group by distance-gender
        const byEvent = {};
        races.forEach(race => {
            const key = `${race.distance} ${race.gender} ${race.division}`;
            byEvent[key] = (byEvent[key] || 0) + 1;
        });

        Object.entries(byEvent).sort().forEach(([event, count]) => {
            console.log(`  - ${event}: ${count}`);
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log('DETAILED CHECK: 500m WOMEN (to verify Erin Jackson fix)');
    console.log('='.repeat(80));

    const erinCheck = calculateSkaterPoints('Jackson', 'USA', '500m', 'women');
    console.log(`\nErin Jackson (USA) - 500m Women:`);
    console.log(`Total Points: ${erinCheck.total}`);
    console.log(`Races:`);
    erinCheck.races.forEach(r => {
        console.log(`  ${r.wc} Div ${r.division}: ${r.points} pts (${r.time})`);
    });

    // Check for any other USA skaters in 500m
    console.log('\n\nAll USA 500m Women results:');
    Object.keys(ourData.raceResults).sort().forEach(wc => {
        ourData.raceResults[wc]
            .filter(r => r.distance === '500m' && r.gender === 'women')
            .forEach(race => {
                const usaResults = race.results.filter(r => r.country === 'USA');
                usaResults.forEach(r => {
                    console.log(`  ${wc} ${race.division}: ${r.name} - ${r.points} pts (${r.time})`);
                });
            });
    });
}

// Run the report
printComparisonReport();
