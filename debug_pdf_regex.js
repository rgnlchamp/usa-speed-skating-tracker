const { parsePDF, parseRaceText } = require('./src/data/pdf_parser');
const PDFParser = require('pdf2json');

(async () => {
    console.log('=== Debugging PDF Text ===\n');

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

        console.log('Full text length:', fullText.length);
        console.log('\nFirst 1500 chars:');
        console.log(fullText.substring(0, 1500));

        console.log('\n\n=== Testing regex on sample line ===');
        // Sample line from the PDF
        const sampleLine = "1 330 Ying- Chu CHEN TPE 17 Ou t 37.78 28";
        console.log('Sample:', sampleLine);

        const regex = /(\d+)\s+\d+\s+([A-ZÀ-ÿ][A-ZÀ-ÿ\s\-'éíóäöüÉÍÓêâ]+?)\s+([A-Z]{3})\s+.+?\s+(\d+:\d+\.\d+|\d+\.\d+(?:\(\d+\))?)\s+(?:\+[\d:.]+\s+)?(\d+)/g;

        const match = regex.exec(sampleLine);
        if (match) {
            console.log('Match found!');
            console.log('  Rank:', match[1]);
            console.log('  Name:', match[2]);
            console.log('  Country:', match[3]);
            console.log('  Time:', match[4]);
            console.log('  Points:', match[5]);
        } else {
            console.log('No match!');
        }

        console.log('\n=== Testing on actual text ===');
        const regex2 = /(\d+)\s+\d+\s+([A-ZÀ-ÿ][A-ZÀ-ÿ\s\-'éíóäöüÉÍÓêâ]+?)\s+([A-Z]{3})\s+.+?\s+(\d+:\d+\.\d+|\d+\.\d+(?:\(\d+\))?)\s+(?:\+[\d:.]+\s+)?(\d+)/g;
        const matches = [];
        let m;
        while ((m = regex2.exec(fullText)) !== null) {
            matches.push({ rank: m[1], name: m[2].trim(), country: m[3], time: m[4], points: m[5] });
            if (matches.length >= 5) break;
        }

        console.log(`Found ${matches.length} matches (showing first 5)`);
        matches.forEach(m => {
            console.log(`  ${m.rank}. ${m.name} (${m.country}) - ${m.time} [${m.points} pts]`);
        });
    });

    pdfParser.loadPDF('data/pdf/9_result_women_500_b_1-signed_20251115175152.pdf');
})();
