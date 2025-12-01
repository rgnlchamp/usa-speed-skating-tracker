const { parseRaceText } = require('./src/data/pdf_parser');

const testText = `
1 101 Marina ZUEVA AIN 4:00.00 100
2 102 Kseniia KORZHOVA AIN 4:01.00 80
3 103 Elizaveta GOLUBEVA AIN 4:02.00 60
`;

const mockFilename = '14_Result_Women_3000_Division_A_20251114.pdf';

console.log('Testing parseRaceText with AIN athletes...');
const result = parseRaceText(testText, mockFilename);

result.results.forEach(r => {
    console.log(`Rank: ${r.rank}, Name: "${r.name}", Country: "${r.country}"`);
});
