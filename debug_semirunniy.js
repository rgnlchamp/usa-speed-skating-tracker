const fs = require('fs');
const PDFParser = require('pdf2json');

const files = [
    "data/pdf/9_result_men_10000_a-ondertekend_20251206151857.pdf"
];

async function checkFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    const pdfParser = new PDFParser();

    return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            console.log(`\n--- Checking ${filePath} ---`);
            const matches = rawText.match(/Semirunniy|Vladimir/gi);
            if (matches) {
                console.log(`Found ${matches.length} matches for "Semirunniy" or "Vladimir"`);
                // Split lines and show context
                const lines = rawText.split(/\r\n|\r|\n/);
                lines.forEach((line, index) => {
                    if (line.match(/Semirunniy|Vladimir/i)) {
                        console.log(`Line ${index}: ${line.trim()}`);
                    }
                });
            } else {
                console.log('No matches for "Semirunniy"');
            }
            resolve();
        });

        pdfParser.loadPDF(filePath);
    });
}


async function run() {
    for (const file of files) {
        try {
            await checkFile(file);
        } catch (err) {
            console.error(`Error processing ${file}:`, err);
        }
    }
}

run();

