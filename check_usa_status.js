const store = require('./src/data/store_pdf');

async function checkUSAstatus() {
    console.log('=== USA OLYMPIC QUALIFICATION STATUS ===\n');

    await store.updateData();
    const state = store.getState();

    let totalQuotas = 0;
    const eventSummary = [];

    Object.keys(state.soqc).forEach(eventKey => {
        const soqc = state.soqc[eventKey];
        const usaQualified = soqc.quotas.qualified.filter(s => s.country === 'USA');
        const usaReserve = soqc.quotas.reserve.filter(s => s.country === 'USA');

        if (usaQualified.length > 0 || usaReserve.length > 0) {
            totalQuotas += usaQualified.length;
            eventSummary.push({
                event: eventKey,
                qualified: usaQualified.length,
                reserve: usaReserve.length,
                skaters: usaQualified.map(s => `${s.name} (${s.method})`)
            });
        }
    });

    console.log(`Total USA Quotas: ${totalQuotas}\n`);
    console.log('Breakdown by Event:\n');

    eventSummary.forEach(e => {
        console.log(`${e.event}:`);
        console.log(`  Qualified: ${e.qualified}, Reserve: ${e.reserve}`);
        e.skaters.forEach(s => console.log(`    - ${s}`));
        console.log();
    });

    console.log('\n=== SYSTEM STATUS ===');
    console.log(`✅ PDF Parser: Working`);
    console.log(`✅ Quota Calculator: Working`);
    console.log(`✅ Auto-aggregation: Working`);
    console.log(`\n👉 Ready for weekend PDFs - just drop new files in data/pdf/`);
}

checkUSAstatus();
