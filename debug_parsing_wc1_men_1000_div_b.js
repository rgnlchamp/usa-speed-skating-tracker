const { parseRaceText } = require('./src/data/pdf_parser');
const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const FILENAME = '4_result_men_1000_b-signed_20251115174412.pdf';
const FILEPATH = path.join(__dirname, 'data/pdf', FILENAME);

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

async function debug() {
    console.log(`Reading ${FILENAME}...`);
    const text = await parsePDF(FILEPATH);

    console.log('--- Debugging Parsing ---');
    const result = parseRaceText(text, FILENAME);

    console.log('--- Results Found ---');
    result.results.forEach(r => {
        console.log(`Rank: ${r.rank}, Name: "${r.name}", Country: ${r.country}, Points: ${r.points}, Time: ${r.time}`);
    });

    console.log('\n--- Missing Skaters Check ---');
    const missing = ['Hendrik Dombek', 'Piotr Michalski'];
    missing.forEach(name => {
        const found = result.results.find(r => r.name.includes(name.split(' ').pop()));
        if (found) console.log(`FOUND: ${name}`);
        else console.log(`MISSING: ${name}`);
    });
}

debug();
