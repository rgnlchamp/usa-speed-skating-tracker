const pdfParser = require('./src/data/pdf_parser');
const fs = require('fs');
const path = require('path');

async function run() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

    console.log(`Found ${files.length} PDFs.`);

    for (const file of files) {
        const filePath = path.join(pdfDir, file);
        if (file.includes('massstart')) {
            try {
                const pdfData = await new Promise((resolve, reject) => {
                    const pdfParser = new (require('pdf2json'))(null, true);
                    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
                    pdfParser.on('pdfParser_dataReady', pdfData => resolve(pdfData));
                    pdfParser.loadPDF(filePath);
                });

                let allText = [];
                pdfData.Pages.forEach(page => {
                    if (page.Texts) {
                        page.Texts.forEach(text => {
                            try {
                                allText.push(decodeURIComponent(text.R[0].T));
                            } catch (e) {
                                allText.push(text.R[0].T);
                            }
                        });
                    }
                });
                const fullText = allText.join(' ');
                console.log(`\n=== RAW TEXT: ${file} ===`);
                console.log(fullText);
            } catch (e) {
                console.error(`✗ FAILED: ${file}`, e);
            }
        }
    }
    console.log('Done parsing all.');
}

run();
