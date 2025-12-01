const { parseRaceText } = require('./src/data/pdf_parser');

// Simulating the spaced out output we saw in the report
const testText = `
1 101 Bj ø rn MAGNUSSEN NOR 34.00 100
2 102 Metod j J Í LEK CZE 35.00 80
3 103 And elika W Ó JCIK POL 36.00 60
`;

const mockFilename = '14_Result_Men_500_Division_A_20251114.pdf';

console.log('Testing parseRaceText with special characters...');
const result = parseRaceText(testText, mockFilename);

result.results.forEach(r => {
    console.log(`Rank: ${r.rank}, Name: "${r.name}", Country: "${r.country}"`);
});
