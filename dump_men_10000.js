const fs = require('fs');
const PDFParser = require('pdf2json');

const filePath = "data/pdf/6_result_men_5000_a-signed_20251115174447.pdf";

const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log(pdfParser.getRawTextContent().substring(0, 3000));
});

pdfParser.loadPDF(filePath);
