const { parseAllPDFs } = require('./src/data/pdf_parser');
const path = require('path');

async function checkTimes() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const races = await parseAllPDFs(pdfDir);

    const skaters = {};

    races.forEach(race => {
        if (race.distance !== '1000m' || race.gender !== 'men') return;

        race.results.forEach(r => {
            if (!skaters[r.name]) skaters[r.name] = { name: r.name, country: r.country, bestTime: '99:99.99' };
            if (r.time && r.time < skaters[r.name].bestTime) {
                skaters[r.name].bestTime = r.time;
            }
        });
    });

    const yankun = Object.values(skaters).find(s => s.name.includes('Yankun') || s.name.includes('Zhao'));
    const nil = Object.values(skaters).find(s => s.name.includes('Nil') || s.name.includes('Llop'));

    console.log('Yankun Zhao:', yankun);
    console.log('Nil Llop Izquierdo:', nil);
}

checkTimes();
