const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== CHECKING 3000M WOMEN ===\n');
        const women3000 = appData.soqc['3000m-women'];
        if (women3000) {
            console.log(`Points qualifiers: ${women3000.points.length}`);
            console.log(`Time qualifiers: ${women3000.times.length}`);
            console.log(`Qualified: ${women3000.quotas.qualified.length}`);
        } else {
            console.log('❌ NO DATA for 3000m women');
        }

        console.log('\n=== CHECKING 5000M MEN ===\n');
        const men5000 = appData.soqc['5000m-men'];
        if (men5000) {
            console.log(`Points qualifiers: ${men5000.points.length}`);
            console.log(`Time qualifiers: ${men5000.times.length}`);
            console.log(`Qualified: ${men5000.quotas.qualified.length}`);

            // Check USA quota
            console.log('\n=== USA QUOTA CHECK (5000m Men) ===\n');
            const usaSkaters = men5000.quotas.qualified.filter(s => s.country === 'USA');
            console.log(`USA skaters qualified: ${usaSkaters.length}`);
            usaSkaters.forEach((skater, i) => {
                console.log(`${i + 1}. ${skater.name} (${skater.method})`);
            });

            if (usaSkaters.length > 1) {
                console.log('\n⚠️ ISSUE: USA has more than 1 quota (should be max 1)');
            }
        } else {
            console.log('❌ NO DATA for 5000m men');
        }

        console.log('\n=== CHECKING RACE DATA ===\n');
        const allRaces = appData.raceResults.WC1 || [];
        const women3000Races = allRaces.filter(r => r.distance === '3000m' && r.gender === 'women');
        const men5000Races = allRaces.filter(r => r.distance === '5000m' && r.gender === 'men');

        console.log(`3000m Women races: ${women3000Races.length}`);
        console.log(`5000m Men races: ${men5000Races.length}`);
    });
});
