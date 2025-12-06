const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

const filename = '20_result_men_500_b_2-signed_20251116182123.pdf';
const pdfPath = path.join(__dirname, 'data/pdf', filename);

async function inspectPDF() {
    console.log(`Parsing ${filename}...`);
    try {
        const data = await parsePDF(pdfPath);
        console.log(`Event: ${data.name}`);

        const joep = data.results.find(r => r.name.includes('Joep') || r.name.includes('Wennemars'));
        if (joep) {
            console.log('\nFOUND JOEP:', joep);
        } else {
            console.log('\nJOEP NOT FOUND in this file.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectPDF();
