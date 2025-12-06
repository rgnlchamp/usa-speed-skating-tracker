const fs = require('fs');
const PDFParser = require('pdf2json');

// Test parsing one PDF to understand structure
async function testParse() {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, true); // raw mode

        pdfParser.on('pdfParser_dataError', errData => {
            console.error('Error:', errData.parserError);
            reject(errData);
        });

        pdfParser.on('pdfParser_dataReady', pdfData => {
            console.log('=== PDF METADATA ===');
            console.log('Pages:', pdfData.Pages.length);
            console.log('Meta:', JSON.stringify(pdfData.Meta, null, 2));

            console.log('\n=== PAGE CONTENT ===');
            // Get all text from all pages
            let allText = [];
            pdfData.Pages.forEach((page, pageNum) => {
                console.log(`\nPage ${pageNum + 1} - Texts found: ${page.Texts?.length || 0}`);
                if (page.Texts) {
                    page.Texts.forEach(text => {
                        const decoded = decodeURIComponent(text.R[0].T);
                        allText.push(decoded);
                    });
                }
            });

            console.log('\n=== EXTRACTED TEXT ===');
            const fullText = allText.join(' ');
            console.log(fullText.substring(0, 2000));

            // Save full text to file for inspection
            fs.writeFileSync('pdf_sample_output.txt', fullText);
            console.log('\n=== Full text saved to pdf_sample_output.txt ===');
            console.log('Total characters:', fullText.length);

            resolve();
        });

        // Try parsing a 500m women's race
        pdfParser.loadPDF('data/pdf/9_result_women_500_b_1-signed_20251115175152.pdf');
    });
}

testParse().then(() => {
    console.log('\n=== DONE ===');
}).catch(err => {
    console.error('Failed:', err);
});
