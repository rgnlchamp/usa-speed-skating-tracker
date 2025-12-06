const { parsePDF } = require('./src/data/pdf_parser');
const path = require('path');

const wc2DivA = '8_result_men_1000_a-signed_20251122010421.pdf';
const wc2DivB = '4_result_men_1000_b-signed_20251121202137.pdf';

async function inspectWC2() {
    const pdfDir = path.join(__dirname, 'data/pdf');

    console.log(`--- Inspecting ${wc2DivA} ---`);
    try {
        const dataA = await parsePDF(path.join(pdfDir, wc2DivA));
        console.log(`Event: ${dataA.name}`);
        dataA.results.forEach(r => {
            console.log(`[A] ${r.rank} ${r.name} (${r.country}) Time:${r.time} Points:${r.points}`);
        });
    } catch (e) { console.error(e); }

    console.log(`\n--- Inspecting ${wc2DivB} ---`);
    try {
        const dataB = await parsePDF(path.join(pdfDir, wc2DivB));
        console.log(`Event: ${dataB.name}`);
        dataB.results.forEach(r => {
            console.log(`[B] ${r.rank} ${r.name} (${r.country}) Time:${r.time} Points:${r.points}`);
        });
    } catch (e) { console.error(e); }
}

inspectWC2();
