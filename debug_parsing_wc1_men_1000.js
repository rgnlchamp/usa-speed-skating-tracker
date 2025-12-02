const { parseRaceText } = require('./src/data/pdf_parser');

const RAW_TEXT = `ISU SPEED SKATING WORLD CUP #1 Utah Olympic Oval - Salt Lake City (Usa) / 14 - 16 Nov 2025 8 . RESULT 1000m Men Friday, 14 November 2025 Rnk Nr Name Ctry pair lane Time Behind Points Created On: 15-11-2025 08:11 www.isu.org / Official ISU results provider: SCGVisual.com / www.isuresults.eu Page 1 of 1 1 181 Jordan STOLZ USA 8 In 1:05.66 60 2 157 Damian Ż UREK POL 4 In 1:06.02 +0.36 54 3 118 Jenning DE BOO NED 9 In 1:06.34 +0.68 48 4 34 Zhongyan NING CHN 7 In 1:06.47 +0.81 43 5 65 Finn SONNEKALB GER 5 Out 1:06.48 +0.82 40 6 126 Tim PRINS NED 10 Out 1:06.64 +0.98 38 7 47 Marten LIIV EST 3 In 1:06.73 +1.07 36 8 85 Ryota KOJIMA JPN 3 Out 1:07.00 +1.34 34 9 131 Joep WENNEMARS NED 8 Out 1:07.01(2) +1.35 32 9 177 Cooper MCLEOD USA 10 In 1:07.01(2) +1.35 32 11 176 Conor MCDERMOTT- MOSTOWY USA 7 Out 1:07.02 +1.36 30 12 151 Marek KANIA POL 4 Out 1:07.30 +1.64 29 13 90 Taiyo NONOMURA JPN 5 In 1:07.32 +1.66 28 14 13 Laurent DUBREUIL CAN 2 Out 1:07.75 +2.09 27 15 62 Moritz KLEIN GER 1 In 1:07.76(3) +2.10 26 16 8 Mathias VOST É BEL 1 Out 1:07.76(5) +2.10 25 17 70 Min- Seok KIM HUN 6 Out 1:07.85 +2.19 24 18 18 Connor HOWE CAN 9 Out 1:09.66 +4.00 23 94 Kazuya YAMADA T09 JPN 2 In DQ 125 Kjeld NUIS T10 NED 6 In DQ Referee: Moyca STOFFEL (CAN) / Starter: Stefan HERRMANN (GER) Conditions Time Air Temperature Humidity Ice Temperature Start 18:47 18,6 30,0 -8,0 End 19:11 18,6 30,0 -8,0 T09 : Obstruction during crossing (254.6) T10 : Cutting the inner line in the curve (254.7)`;

const FILENAME = '8_result_men_1000_a-signed_20251115174506.pdf';

console.log('--- Debugging Parsing ---');
const result = parseRaceText(RAW_TEXT, FILENAME);

console.log('--- Results Found ---');
result.results.forEach(r => {
    console.log(`Rank: ${r.rank}, Name: "${r.name}", Country: ${r.country}, Points: ${r.points}, Time: ${r.time}`);
});

console.log('\n--- Missing Skaters Check ---');
const missing = ['Moritz Klein', 'Mathias Vosté'];
missing.forEach(name => {
    const found = result.results.find(r => r.name === name);
    if (found) console.log(`FOUND: ${name}`);
    else console.log(`MISSING: ${name}`);
});
