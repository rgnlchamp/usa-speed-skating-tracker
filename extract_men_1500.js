const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const DATA_DIR = path.join(__dirname, 'data/pdf');

async function parsePDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on('pdfParser_dataError', errData => resolve(''));
        pdfParser.on('pdfParser_dataReady', pdfData => {
            try {
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
                resolve(allText.join(' '));
            } catch (error) {
                resolve('');
            }
        });
        pdfParser.loadPDF(pdfPath);
    });
}

async function dump() {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.includes('men_1500') && f.endsWith('.pdf'));
    let output = '';

    for (const file of files) {
        output += `\n--- FILE: ${file} ---\n`;
        const text = await parsePDF(path.join(DATA_DIR, file));
        output += text + '\n';
    }

    fs.writeFileSync('men_1500_dump.md', output);
    console.log('Dump saved to men_1500_dump.md');
}

dump();
