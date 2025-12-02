const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const DATA_DIR = path.join(__dirname, 'data/pdf');
const SKATERS = ['Moritz Klein', 'Mathias Vosté', 'Mathias Voste'];

async function parsePDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);

        pdfParser.on('pdfParser_dataError', errData => {
            resolve(''); // Ignore errors, just return empty text
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

async function checkWC1() {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.toLowerCase().includes('men') && f.toLowerCase().includes('1000') && f.endsWith('.pdf'));

    console.log('Checking Men 1000m files:', files);

    for (const file of files) {
        console.log(`\nReading ${file}...`);
        const text = await parsePDF(path.join(DATA_DIR, file));

        SKATERS.forEach(name => {
            if (text.includes(name) || text.includes(name.toUpperCase())) {
                console.log(`  FOUND: "${name}" in ${file}`);
                const index = text.indexOf(name) !== -1 ? text.indexOf(name) : text.indexOf(name.toUpperCase());
                console.log(`    Context: ...${text.substring(index - 50, index + 50).replace(/\n/g, ' ')}...`);
            } else {
                console.log(`  NOT FOUND: "${name}"`);
            }
        });
    }
}

checkWC1();
