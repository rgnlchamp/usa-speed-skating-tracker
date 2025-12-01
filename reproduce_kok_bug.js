const { parseRaceText } = require('./src/data/pdf_parser');

const testText = `
1 101 Femke KOK NED 37.00 100
2 102 Jane DOE USA 38.00 80
3 103 Short NAM KOR 39.00 60
`;

const mockFilename = '14_Result_Women_500_Division_A_20251114.pdf';

console.log('Testing parseRaceText with "Femke KOK NED"...');
const result = parseRaceText(testText, mockFilename);

result.results.forEach(r => {
    console.log(`Rank: ${r.rank}, Name: "${r.name}", Country: "${r.country}"`);
});

const femke = result.results.find(r => r.rank === '1');
if (femke && femke.country === 'KOK') {
    console.log('\nFAIL: "KOK" was misidentified as country code.');
} else if (femke && femke.country === 'NED') {
    console.log('\nPASS: "NED" correctly identified as country code.');
} else {
    console.log('\nUNCERTAIN: Check output.');
}
