const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');
const fs = require('fs');

async function auditFiles() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    const audit = {};

    console.log(`Auditing ${files.length} files...`);

    for (const file of files) {
        const filePath = path.join(pdfDir, file);
        try {
            const race = await parsePDF(filePath);

            const key = `${race.distance} ${race.gender}`;
            if (!audit[key]) audit[key] = { wc1: [], wc2: [] };

            const dateMatch = file.match(/202511(\d{2})/);
            let wc = 'unknown';
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                if (day >= 14 && day <= 17) wc = 'wc1';
                else if (day >= 21 && day <= 24) wc = 'wc2';
            }

            if (wc !== 'unknown') {
                audit[key][wc].push(race.division);
            }
        } catch (e) {
            console.error(`Error parsing ${file}:`, e.message);
        }
    }

    console.log('\n--- PDF Audit Report ---');
    Object.entries(audit).forEach(([event, wcs]) => {
        console.log(`\n${event}:`);
        console.log(`  WC1 (SLC): ${wcs.wc1.length} races [${wcs.wc1.join(', ')}]`);
        console.log(`  WC2 (CAL): ${wcs.wc2.length} races [${wcs.wc2.join(', ')}]`);
    });
}

auditFiles();
