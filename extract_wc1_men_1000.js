const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const DATA_DIR = path.join(__dirname, 'data/pdf');
const FILES = [
    '4_result_men_1000_b-signed_20251115174412.pdf',
    '8_result_men_1000_a-signed_20251115174506.pdf'
];

async function parsePDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on('pdfParser_dataError', errData => {
            resolve('');
        });

        pdfParser.on('pdfParser_dataReady', pdfData => {
            try {
                let allText = [];
                pdfData.Pages.forEach(page => {
                    if (page.Texts) {
                        page.Texts.forEach(text => {
                            try {
                                const decoded = decodeURIComponent(text.R[0].T);
                                allText.push(decoded);
                            } catch (e) {
                                allText.push(text.R[0].T);
                            }
                        });
                    }
                });
                resolve(allText.join(' '));
            } catch (error) {
                resolve('');
            }
        });

        pdfParser.loadPDF(pdfPath);
    });
}

async function dump() {
    let output = '';
    for (const file of FILES) {
        output += `\n--- FILE: ${file} ---\n`;
        const text = await parsePDF(path.join(DATA_DIR, file));
        output += text + '\n';
    }
    fs.writeFileSync('wc1_men_1000_dump.md', output); // Use .md to bypass gitignore for output too
    console.log('Dump saved to wc1_men_1000_dump.md');
}

dump();
