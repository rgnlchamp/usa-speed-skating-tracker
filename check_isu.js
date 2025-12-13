const d = require('./public/data.json');

// Official ISU 500m Women standings (scraped from live.isuresults.eu Dec 13, 2025)
const official500W = [
    { rank: 1, name: 'Femke Kok', total: 360 },
    { rank: 2, name: 'Marrit Fledderus', total: 251 },
    { rank: 3, name: 'Erin Jackson', total: 235 },
    { rank: 4, name: 'Yukino Yoshida', total: 235 },
    { rank: 5, name: 'Jutta Leerdam', total: 219 },
    { rank: 6, name: 'Anna Boersma', total: 212 },
    { rank: 7, name: 'Na-Hyun Lee', total: 211 },
    { rank: 8, name: 'Ying-Chu Chen', total: 195 },
    { rank: 9, name: 'Serena Pergher', total: 193 },
    { rank: 10, name: 'Martyna Baran', total: 188 },
    { rank: 11, name: 'Béatrice Lamarche', total: 187 },
    { rank: 12, name: 'Sophie Warmuth', total: 186 },
    { rank: 13, name: 'Kaja Ziomek-Nogal', total: 182 },
    { rank: 14, name: 'Kristina Silaeva', total: 177 },
    { rank: 15, name: 'Min-Sun Kim', total: 174 }
];

// Get our SOQC points ranking
const our500W = d.soqc['500m-women']?.points?.slice(0, 15) || [];

console.log('=== 500m WOMEN VALIDATION ===\n');

let matches = 0;
let mismatches = [];

for (let i = 0; i < official500W.length; i++) {
    const isu = official500W[i];
    const ours = our500W[i];
    const ourPts = ours?.totalPoints || 0;

    if (ourPts === isu.total) {
        matches++;
        console.log(`✓ #${isu.rank} ${isu.name}: ${ourPts}`);
    } else {
        mismatches.push({ rank: isu.rank, name: isu.name, isu: isu.total, ours: ourPts });
        console.log(`✗ #${isu.rank} ${isu.name}: Ours=${ourPts} ISU=${isu.total} (diff: ${ourPts - isu.total})`);
    }
}

console.log(`\n=== RESULT: ${matches}/15 match ===`);
if (mismatches.length > 0) {
    console.log('\nMismatches need investigation:');
    mismatches.forEach(m => {
        console.log(`  #${m.rank} ${m.name}: We have ${m.ours}, ISU has ${m.isu}`);
    });
}
