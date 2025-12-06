const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);
        const women500 = appData.soqc['500m-women'];

        console.log('\n=== UPDATED TIMES CHECK ===\n');

        // Check specific athletes
        const athletes = ['Jutta Leerdam', 'Brooklyn McDougall', 'Marrit Fledderus', 'Lee Na-hyun'];

        athletes.forEach(name => {
            const searchName = name.toLowerCase();
            let found = null;

            for (const athlete of women500.times) {
                if (athlete.name.toLowerCase().includes(searchName) || searchName.includes(athlete.name.toLowerCase())) {
                    found = athlete;
                    break;
                }
            }

            if (found) {
                console.log(`${name}:`);
                console.log(`  Best Time: ${found.bestTime}`);
                console.log(`  Total Points: ${found.totalPoints}`);
                console.log('');
            } else {
                console.log(`${name}: NOT FOUND\n`);
            }
        });

        console.log('=== TOP 5 BY BEST TIME ===\n');
        const sorted = [...women500.times].sort((a, b) => {
            return parseFloat(a.bestTime.replace(':', '')) - parseFloat(b.bestTime.replace(':', ''));
        });

        sorted.slice(0, 5).forEach((athlete, i) => {
            console.log(`${i + 1}. ${athlete.name.padEnd(25)} ${athlete.bestTime}`);
        });
    });
});
