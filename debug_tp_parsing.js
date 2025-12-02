const path = require('path');
const { parsePDF } = require('./src/data/pdf_parser');

const pdfPath = path.join(__dirname, 'data/pdf/22_result_menteampursuit_a-signed_20251123205639.pdf');

async function test() {
    console.log(`Testing parser on: ${pdfPath}`);
    try {
        const result = await parsePDF(pdfPath);
        console.log('--- Result ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
