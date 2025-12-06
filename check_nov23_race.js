const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== CHECKING NOVEMBER 23RD RACE ===\n');

        // Look for the specific race from Nov 23
        if (appData.raceResults && appData.raceResults.WC1) {
            const allRaces = appData.raceResults.WC1;

            // Find women's 500m races
            const women500 = allRaces.filter(r => r.distance === '500m' && r.gender === 'women');

            console.log(`Total Women's 500m races loaded: ${women500.length}\n`);

            women500.forEach((race, i) => {
                console.log(`Race ${i + 1}: Division ${race.division}`);
                console.log(`  URL: ${race.url}`);
                console.log(`  Results: ${race.results.length} athletes`);

                // Check for Jutta and Marrit
                const jutta = race.results.find(r => r.name.includes('LEERDAM'));
                const marrit = race.results.find(r => r.name.includes('FLEDDERUS'));

                if (jutta) {
                    console.log(`  Jutta LEERDAM: Rank ${jutta.rank}, Time ${jutta.time}`);
                }
                if (marrit) {
                    console.log(`  Marrit FLEDDERUS: Rank ${marrit.rank}, Time ${marrit.time}`);
                }
                console.log('');
            });
        }

        // Check their calculated best times
        console.log('\n=== CALCULATED BEST TIMES ===\n');
        const women500soqc = appData.soqc['500m-women'];

        const jutta = women500soqc.times.find(a => a.name.includes('LEERDAM'));
        const marrit = women500soqc.times.find(a => a.name.includes('FLEDDERUS'));

        if (jutta) {
            console.log(`Jutta LEERDAM: Best Time = ${jutta.bestTime}`);
        }
        if (marrit) {
            console.log(`Marrit FLEDDERUS: Best Time = ${marrit.bestTime}`);
        }
    });
});
