const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

const filename = '12_result_men_500_a_1-signed_20251115204545 (1).pdf';
const pdfPath = path.join(__dirname, 'data/pdf', filename);

async function inspectPDF() {
    console.log(`Parsing ${filename}...`);
    try {
        const data = await parsePDF(pdfPath);
        console.log(`Event: ${data.name}`);

        const stefan = data.results.find(r => r.name.includes('Stefan') || r.name.includes('Westenbroek'));
        if (stefan) {
            console.log('\nFOUND STEFAN:', stefan);
        } else {
            console.log('\nSTEFAN NOT FOUND in this file.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectPDF();
