const fs = require('fs');
const path = require('path');

async function listMen1000Files() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const files = fs.readdirSync(pdfDir).filter(f => f.toLowerCase().includes('men_1000'));

    console.log('--- Men 1000m Files ---');
    files.forEach(f => console.log(f));
    console.log(`Total: ${files.length}`);
}

listMen1000Files();
