const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== 5000M MEN - USA QUOTA ISSUE ===\n');
        const men5000 = appData.soqc['5000m-men'];

        if (men5000) {
            // Show all qualified skaters
            console.log('All qualified skaters:');
            const nocCounts = {};
            men5000.quotas.qualified.forEach((skater, i) => {
                nocCounts[skater.country] = (nocCounts[skater.country] || 0) + 1;
                const flag = skater.country === 'USA' ? '← USA' : '';
                console.log(`${(i + 1).toString().padStart(2)}. ${skater.name.padEnd(30)} ${skater.country} (${skater.method}) ${flag}`);
            });

            console.log('\n=== NOC QUOTA COUNTS ===\n');
            Object.entries(nocCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([country, count]) => {
                    const warning = count > 3 ? ' ⚠️ EXCEEDS MAX' : '';
                    const usaWarning = country === 'USA' && count > 1 ? ' ⚠️ Should be 1 max for USA' : '';
                    console.log(`${country}: ${count}${warning}${usaWarning}`);
                });
        }
    });
});
