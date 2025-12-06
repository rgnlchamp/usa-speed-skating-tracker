const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const wc2DivA = '8_result_men_1000_a-signed_20251122010421.pdf';
const wc2DivB = '4_result_men_1000_b-signed_20251121202137.pdf';

async function dumpPdfText() {
    const pdfDir = path.join(__dirname, 'data/pdf');

    function parse(filename) {
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser(this, 1);
            pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", pdfData => {
                const text = pdfParser.getRawTextContent();
                console.log(`\n--- Text Dump: ${filename} ---`);

                const tokens = text.split(/\s+/);
                const index = tokens.findIndex(t => t.toLowerCase().includes('yankun'));
                if (index !== -1) {
                    console.log(`\n[FOUND] 'Yankun' at token index ${index}`);
                    const start = Math.max(0, index - 5);
                    const end = Math.min(tokens.length, index + 15);
                    console.log('Surrounding tokens:', tokens.slice(start, end));
                    console.log('Total tokens:', tokens.length);
                } else {
                    console.log('\n[NOT FOUND] Yankun not found in tokens.');
                }
                resolve();
            });
            pdfParser.loadPDF(path.join(pdfDir, filename));
        });
    }

    await parse(wc2DivA);
    await parse(wc2DivB);
}

dumpPdfText();
