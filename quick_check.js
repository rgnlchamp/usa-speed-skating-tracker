const store = require('./src/data/store_pdf');
const xlsx = require('xlsx');

async function quickCheck() {
    console.log('Loading app data...');
    await store.updateData();
    const state = store.getState();

    // Check Men 1000m specifically (where we fixed Yankun Zhao)
    console.log('\n=== MEN 1000m - Yankun Zhao Verification ===');
    let yankunTotal = 0;
    ['WC1', 'WC2'].forEach(wc => {
        const races = state.raceResults[wc]?.filter(r => r.distance === '1000m' && r.gender === 'men');
        if (races) {
            races.forEach(race => {
                const yankun = race.results.find(r => r.name.includes('Yankun'));
                if (yankun) {
                    console.log(`${wc} (Div ${race.division}): Rank ${yankun.rank}, Points ${yankun.points}`);
                    yankunTotal += parseInt(yankun.points);
                }
            });
        }
    });
    console.log(`Yankun Zhao Total Points: ${yankunTotal} ${yankunTotal === 18 ? '✓' : '✗'}`);

    // Read Excel
    console.log('\n=== Reading Excel Official Data ===');
    const workbook = xlsx.readFile('SOCQ_OWG_2026 (3).xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Find Yankun in Excel
    const yankunExcel = data.find(row =>
        row['Men - 1000'] &&
        (row['Men - 1000'].includes('Yankun') || row['Men - 1000'].includes('Zhao'))
    );

    if (yankunExcel) {
        console.log('Yankun in Official Excel:', yankunExcel['Men - 1000']);
        console.log('Category:', yankunExcel.__EMPTY_1 || 'Unknown');
    }

    console.log('\n=== Overall Event Counts ===');
    const events = ['500m', '1000m', '1500m', '5000m'];
    const genders = ['men', 'women'];

    events.forEach(dist => {
        genders.forEach(gender => {
            const key = `${dist}-${gender}`;
            const soqc = state.soqc[key];
            if (soqc) {
                const pointsCount = soqc.points?.length || 0;
                const timesCount = soqc.times?.length || 0;
                const qualified = soqc.quotas?.qualified?.length || 0;
                const reserve = soqc.quotas?.reserve?.length || 0;
                console.log(`${dist} ${gender}: ${qualified} qualified (${pointsCount} points, ${timesCount} times), ${reserve} reserve`);
            }
        });
    });
}

quickCheck().catch(console.error);
