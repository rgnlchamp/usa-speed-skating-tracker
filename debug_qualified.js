const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));

const soqc = data.soqc['500m-men'];
const qualified = soqc.quotas.qualified;

console.log('Qualified Array:');
// Sort by Country for easier reading
qualified.sort((a, b) => a.country.localeCompare(b.country));

qualified.forEach((s, i) => {
    console.log(`${s.country} | ${s.name} | ${s.totalPoints} | ${s.bestTime}`);
});
