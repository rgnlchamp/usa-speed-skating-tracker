const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

const filename = '14_result_men_500_a_1-signed_20251122210219.pdf';
const pdfPath = path.join(__dirname, 'data/pdf', filename);

async function inspectPDF() {
    console.log(`Parsing ${filename}...`);
    try {
        const data = await parsePDF(pdfPath);
        console.log(`Event: ${data.name}`);
        console.log(`Date: ${data.eventDate}`);
        console.log(`Location: ${data.eventLocation}`);
        console.log(`Results: ${data.results.length}`);

        console.log('\n--- Results ---');
        data.results.forEach(r => {
            console.log(`${r.rank} ${r.name} (${r.country}) Time: ${r.time} Points: ${r.points}`);
        });

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
