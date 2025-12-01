const PDFParser = require('pdf2json');

// Parse the Division A race 1 PDF where Femke should be
const pdfParser = new PDFParser(null, true);

pdfParser.on('pdfParser_dataError', errData => {
    console.error('Error:', errData.parserError);
});

pdfParser.on('pdfParser_dataReady', pdfData => {
    // Extract all text
    let allText = [];
    pdfData.Pages.forEach(page => {
        if (page.Texts) {
            page.Texts.forEach(text => {
                const decoded = decodeURIComponent(text.R[0].T);
                allText.push(decoded);
            });
        }
    });

    const fullText = allText.join(' ');

    // Find the section with rank 1
    const tokens = fullText.split(/\s+/);

    console.log('=== Looking for Rank 1 entries ===\n');

    // Find indices where we have "1" followed by a bib number
    for (let i = 0; i < tokens.length - 20; i++) {
        if (tokens[i] === '1' && !isNaN(parseInt(tokens[i + 1])) && parseInt(tokens[i + 1]) > 100) {
            // This might be a rank 1 entry
            const context = tokens.slice(i, i + 15).join(' ');
            console.log(`Found potential rank 1: ${context}`);
            console.log('');
        }
    }
});

pdfParser.loadPDF('data/pdf/11_result_women_500_a_1-signed_20251115202552.pdf');
