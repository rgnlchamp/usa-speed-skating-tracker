const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));
const orderedKeys = [
    '500m-women', '500m-men',
    '1000m-women', '1000m-men',
    '1500m-women', '1500m-men',
    '3000m-women', '5000m-men',
    '5000m-women', '10000m-men',
    'Mass Start-women', 'Mass Start-men',
    'Team Pursuit-women', 'Team Pursuit-men'
];
let total = 0;
orderedKeys.forEach(key => {
    const q = data.soqc[key].quotas.qualified.filter(s => s.country === 'USA');
    console.log(`${key}: ${q.length}`);
    total += q.length;
});
console.log(`Total: ${total}`);
