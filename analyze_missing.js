const http = require('http');

// Check what we have vs what Wikipedia shows we need
http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const appData = JSON.parse(data);

        console.log('\n=== ANALYZING WOMEN\'S 500M DATA ===\n');

        const women500 = appData.soqc['500m-women'];

        // Athletes Wikipedia has that we should check
        const wikiAthletes = [
            'Femke Kok', 'Erin Jackson', 'Yukino Yoshida', 'Jutta Leerdam',
            'Lee Na-hyun', 'Marrit Fledderus', 'Anna Boersma', 'Chen Ying-chu',
            'Kaja Ziomek-Nogal', 'Martyna Baran', 'Angel Daleman', 'Serena Pergher',
            'Béatrice Lamarche', 'Andżelika Wójcik', 'Kristina Silaeva', 'Tian Ruining',
            'Sophie Warmuth', 'Kim Min-sun', 'Kurumi Inagawa', 'Rio Yamada',
            'Brooklyn McDougall', 'Carolina Hiller-Donnelly', 'Nadezhda Morozova'
        ];

        // Create our lookup
        const appNames = new Set();
        women500.points.forEach(a => appNames.add(a.name.toLowerCase()));
        women500.times.forEach(a => appNames.add(a.name.toLowerCase()));

        console.log('Athletes in Wikipedia but MISSING from our app:\n');
        const missing = [];
        wikiAthletes.forEach(name => {
            const searchName = name.toLowerCase();
            let found = false;

            for (const appName of appNames) {
                if (appName.includes(searchName) || searchName.includes(appName)) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                missing.push(name);
                console.log(`  ✗ ${name}`);
            }
        });

        if (missing.length === 0) {
            console.log('  (None - all athletes found!)');
        }

        console.log(`\n\nTotal missing: ${missing.length} out of ${wikiAthletes.length}`);

        // Check what races we have
        console.log('\n\n=== WOMEN\'S 500M RACES WE HAVE ===\n');

        if (appData.raceResults && appData.raceResults.WC1) {
            const women500races = appData.raceResults.WC1.filter(r =>
                r.distance === '500m' && r.gender === 'women'
            );

            console.log(`Total Women's 500m races: ${women500races.length}\n`);
            women500races.forEach((race, i) => {
                console.log(`${i + 1}. Division ${race.division} - ${race.url}`);
                console.log(`   Results: ${race.results.length} athletes`);
            });
        }

        console.log('\n\n=== SPECIFIC MISSING ATHLETES ANALYSIS ===\n');

        // Check specific cases
        console.log('Lee Na-hyun (ranked #5 on Wikipedia):');
        const leeVariants = ['lee na-hyun', 'na-hyun lee', 'lee na hyun', 'nahyun lee'];
        let leeFound = false;
        for (const variant of leeVariants) {
            for (const appName of appNames) {
                if (appName.includes(variant)) {
                    console.log(`  ✓ Found as: "${Array.from(appNames).find(n => n.includes(variant))}"`);
                    leeFound = true;
                    break;
                }
            }
            if (leeFound) break;
        }
        if (!leeFound) {
            console.log('  ✗ NOT FOUND - This athlete competed but is not in our PDFs');
            console.log('  → Possible reasons:');
            console.log('     - Name spelling different in PDFs (check for "Na-Hyun LEE" or "LEE Na-Hyun")');
            console.log('     - Competed in a division/race we don\'t have the PDF for');
        }

        console.log('\n\nChen Ying-chu (ranked #8 on Wikipedia):');
        const chenFound = Array.from(appNames).some(n => n.includes('ying-chu') || n.includes('chen'));
        if (chenFound) {
            const chenName = Array.from(appNames).find(n => n.includes('ying-chu') || (n.includes('chen') && !n.includes('chung')));
            console.log(`  ✓ Found as: "${chenName}"`);
        } else {
            console.log('  ✗ NOT FOUND');
        }
    });
});
