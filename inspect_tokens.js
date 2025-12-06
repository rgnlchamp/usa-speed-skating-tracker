const PDFParser = require('pdf2json');
const path = require('path');

const pdfPath = path.join(__dirname, 'data/pdf/12_result_men_500_a_1-signed_20251115205423.pdf');
const pdfParser = new PDFParser(null, true);

pdfParser.on('pdfParser_dataReady', pdfData => {
    let allText = [];
    pdfData.Pages.forEach(page => {
        if (page.Texts) {
            page.Texts.forEach(text => {
                allText.push(decodeURIComponent(text.R[0].T));
            });
        }
    });

    const fullText = allText.join(' ');
    const tokens = fullText.split(/\s+/);

    console.log('First 100 tokens:');
    console.log(tokens.slice(0, 100).join(' | '));
});

pdfParser.loadPDF(pdfPath);
