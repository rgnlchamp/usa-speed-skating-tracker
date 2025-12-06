const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);
        const men5000 = appData.soqc['5000m-men'];

        console.log('\n=== 5000M MEN - USA SKATERS DETAIL ===\n');

        // Find Casey and Ethan in points ranking
        const casey = men5000.points.find(s => s.name.includes('DAWSON'));
        const ethan = men5000.points.find(s => s.name.includes('CEPURAN'));

        if (casey) {
            console.log('Casey DAWSON:');
            console.log(`  Rank in points: ${men5000.points.indexOf(casey) + 1}`);
            console.log(`  Total Points: ${casey.totalPoints}`);
            console.log(`  Best Time: ${casey.bestTime}`);
        }

        if (ethan) {
            console.log('\nEthan CEPURAN:');
            console.log(`  Rank in points: ${men5000.points.indexOf(ethan) + 1}`);
            console.log(`  Total Points: ${ethan.totalPoints}`);
            console.log(`  Best Time: ${ethan.bestTime}`);
        }

        console.log('\n=== QUALIFICATION BREAKDOWN ===\n');
        console.log('Total qualified:', men5000.quotas.qualified.length);
        console.log('From Points:', men5000.quotas.qualified.filter(s => s.method === 'Points').length);
        console.log('From Times:', men5000.quotas.qualified.filter(s => s.method === 'Times').length);

        console.log('\n=== NOC COUNTS IN QUALIFIED ===\n');
        const nocCounts = {};
        men5000.quotas.qualified.forEach(s => {
            nocCounts[s.country] = (nocCounts[s.country] || 0) + 1;
        });

        Object.entries(nocCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([country, count]) => {
                console.log(`${country}: ${count}`);
            });
    });
});
