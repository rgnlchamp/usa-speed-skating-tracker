const fs = require('fs');
const path = require('path');
const { parsePDF } = require('./src/data/pdf_parser');

// Missing athletes we need to find
const missingAthletes = [
    { name: 'Yankun Zhao', country: 'CAN', event: 'Men 500m' },
    { name: 'Sanghyeok Cho', country: 'KOR', event: 'Men 500m' },
    { name: 'Tatsuya Shinhama', country: 'JPN', event: 'Men 500m' },
    { name: 'Katsuhiro Kuratsubo', country: 'JPN', event: 'Men 500m' },
    { name: 'Haonan Du', country: 'CHN', event: 'Men 500m' },
    { name: 'Stefan Westenbroek', country: 'NED', event: 'Men 500m' },
    { name: 'Anders Johnson', country: 'CAN', event: 'Men 500m' },
    { name: 'Merijn Scheperkamp', country: 'NED', event: 'Men 500m' }
];

async function findMissingAthletes() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

    console.log(`Scanning ${files.length} PDF files for missing athletes...\n`);

    const found = {};
    missingAthletes.forEach(a => found[a.name] = []);

    for (const file of files) {
        // Only check Men 500m files
        if (!file.toLowerCase().includes('men') || !file.toLowerCase().includes('500')) {
            continue;
        }

        const filePath = path.join(pdfDir, file);

        try {
            const raceData = await parsePDF(filePath);

            // Check if any missing athletes are in this PDF
            for (const athlete of missingAthletes) {
                const foundInRace = raceData.results.find(r =>
                    r.name.includes(athlete.name.split(' ')[1]) || // Last name
                    r.name.includes(athlete.name)
                );

                if (foundInRace) {
                    found[athlete.name].push({
                        file,
                        division: raceData.division,
                        rank: foundInRace.rank,
                        time: foundInRace.time,
                        points: foundInRace.points,
                        parsedAs: foundInRace.name
                    });
                }
            }
        } catch (error) {
            console.error(`Error parsing ${file}:`, error.message);
        }
    }

    // Report findings
    console.log('=== FINDINGS ===\n');
    for (const athlete of missingAthletes) {
        const locations = found[athlete.name];
        if (locations.length > 0) {
            console.log(`✓ ${athlete.name} (${athlete.country}):`);
            locations.forEach(loc => {
                console.log(`  → ${loc.file}`);
                console.log(`     Division ${loc.division}, Rank ${loc.rank}, Time ${loc.time}, Points ${loc.points}`);
                console.log(`     Parsed as: "${loc.parsedAs}"`);
            });
        } else {
            console.log(`✗ ${athlete.name} (${athlete.country}): NOT FOUND IN ANY PDF`);
        }
        console.log();
    }
}

findMissingAthletes().catch(console.error);
