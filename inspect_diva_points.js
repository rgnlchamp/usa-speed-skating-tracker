const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

const filename = '8_result_men_1000_a-signed_20251115174506.pdf';
const pdfPath = path.join(__dirname, 'data/pdf', filename);

async function inspectDivAPDF() {
    console.log(`Parsing ${filename}...`);
    try {
        const data = await parsePDF(pdfPath);
        console.log(`Event: ${data.name}`);

        console.log('\n--- First 5 Results ---');
        data.results.slice(0, 5).forEach(r => {
            console.log(`${r.rank} ${r.name} (${r.country}) Time: ${r.time} Points: ${r.points}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectDivAPDF();
