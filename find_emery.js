const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== FINDING EMERY LEHMAN IN 5000M MEN ===\n');

        const allRaces = appData.raceResults.WC1 || [];
        const men5000Races = allRaces.filter(r => r.distance === '5000m' && r.gender === 'men');

        console.log(`Total 5000m men races: ${men5000Races.length}\n`);

        men5000Races.forEach((race, i) => {
            console.log(`Race ${i + 1}: ${race.division} - ${race.url}`);
            const emery = race.results.find(r => r.name.includes('LEHMAN'));
            if (emery) {
                console.log(`  ⚠️ FOUND: ${emery.name} - Rank ${emery.rank}, Time ${emery.time}`);
            }
        });

        // Also check if Emery appears in other distances
        console.log('\n=== CHECKING OTHER DISTANCES FOR EMERY LEHMAN ===\n');
        const distances = ['1500m', '3000m', '10000m'];
        distances.forEach(dist => {
            const races = allRaces.filter(r => r.distance === dist && r.gender === 'men');
            races.forEach(race => {
                const emery = race.results.find(r => r.name.includes('LEHMAN'));
                if (emery) {
                    console.log(`${dist} (${race.division}): ${emery.name}`);
                }
            });
        });
    });
});
