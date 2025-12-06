const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== DETAILED 5000M MEN ANALYSIS ===\n');

        const men5000 = appData.soqc['5000m-men'];

        // Check both points and times rankings for Emery
        console.log('EMERY LEHMAN in 5000m-men rankings:');

        const emeryPoints = men5000.points.find(s => s.name.includes('LEHMAN'));
        if (emeryPoints) {
            console.log('\n⚠️ Found in POINTS ranking:');
            console.log(`  Name: ${emeryPoints.name}`);
            console.log(`  Country: ${emeryPoints.country}`);
            console.log(`  Total Points: ${emeryPoints.totalPoints}`);
            console.log(`  Best Time: ${emeryPoints.bestTime}`);
            console.log(`  Races: ${emeryPoints.races ? emeryPoints.races.length : 0}`);
        } else {
            console.log('✓ NOT in points ranking');
        }

        const emeryTimes = men5000.times.find(s => s.name.includes('LEHMAN'));
        if (emeryTimes) {
            console.log('\n⚠️ Found in TIMES ranking:');
            console.log(`  Name: ${emeryTimes.name}`);
            console.log(`  Country: ${emeryTimes.country}`);
            console.log(`  Best Time: ${emeryTimes.bestTime}`);
        } else {
            console.log('✓ NOT in times ranking');
        }

        const emeryQualified = men5000.quotas.qualified.find(s => s.name.includes('LEHMAN'));
        if (emeryQualified) {
            console.log('\n⚠️ Found in QUALIFIED list:');
            console.log(`  Name: ${emeryQualified.name}`);
            console.log(`  Method: ${emeryQualified.method}`);
        }

        const emeryReserve = men5000.quotas.reserve.find(s => s.name.includes('LEHMAN'));
        if (emeryReserve) {
            console.log('\n⚠️ Found in RESERVE list:');
            console.log(`  Name: ${emeryReserve.name}`);
        }

        console.log('\n=== USA SKATERS IN 5000M ===\n');
        console.log('Qualified:');
        men5000.quotas.qualified.filter(s => s.country === 'USA').forEach(s => {
            console.log(`  - ${s.name} (${s.method})`);
        });

        console.log('\nReserve:');
        men5000.quotas.reserve.filter(s => s.country === 'USA').forEach(s => {
            console.log(`  - ${s.name}`);
        });
    });
});
