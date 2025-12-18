const fs = require('fs');
const path = require('path');

// Load data
const data = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));

// Inspect 500m Men
const eventKey = '500m-men';
const soqc = data.soqc[eventKey];

if (!soqc) {
    console.log(`No data for ${eventKey}`);
    process.exit();
}

console.log(`Analyzing ${eventKey}...`);

// Check Qualified NOC counts
const qualified = soqc.quotas.qualified;
const nocCounts = {};
qualified.forEach(s => {
    nocCounts[s.country] = (nocCounts[s.country] || 0) + 1;
});

console.log('NOC Counts (Qualified):');
Object.entries(nocCounts).forEach(([noc, count]) => {
    console.log(`  ${noc}: ${count}`);
});

// Check Reserve List Order in State (before reallocation split?)
// data.json has final 'reserve' and 'reallocationList'.
// 'reserve' field in data.json seems to be the one mapped with method 'Reserve'.
// Wait, store_pdf.js lines:
// state.soqc[key].quotas.reserve = finalQuotas.reserve.map(...)
// state.soqc[key].quotas.reallocationList = finalQuotas.reallocationList.map(...)

const reserve = soqc.quotas.reserve;
const reallocationList = soqc.quotas.reallocationList;

console.log('\nOfficial Reserve List (Time Sorted?):');
reserve.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name} (${s.country}) - ${s.bestTime}`);
});

console.log('\nReallocation List (Priority Order):');
reallocationList.forEach((s, i) => {
    const status = nocCounts[s.country] ? `Has ${nocCounts[s.country]} quotas` : '0 quotas (PRIORITY)';
    console.log(`  ${i + 1}. ${s.name} (${s.country}) - ${s.bestTime} [${status}]`);
});

// Check specific athletes
const galiyev = reserve.find(s => s.name.includes('Galiyev'));
if (galiyev) {
    console.log(`\nArtur Galiyev found in reserve:`);
    console.log(`  Country: ${galiyev.country}`);
    console.log(`  Qualified Quotas for ${galiyev.country}: ${nocCounts[galiyev.country] || 0}`);
} else {
    console.log('\nArtur Galiyev NOT found in reserve list.');
}

const rosanelli = reserve.find(s => s.name.includes('Rosanelli'));
if (rosanelli) {
    console.log(`\nJeffrey Rosanelli found in reserve:`);
    console.log(`  Country: ${rosanelli.country}`);
    console.log(`  Qualified Quotas for ${rosanelli.country}: ${nocCounts[rosanelli.country] || 0}`);
}
