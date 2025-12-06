const fs = require('fs');
const path = require('path');

async function verifyMen1000Files() {
    const pdfDir = path.join(__dirname, 'data/pdf');
    const allFiles = fs.readdirSync(pdfDir);

    // Strict filter: must contain '_men_1000' and NOT 'women'
    const menFiles = allFiles.filter(f =>
        f.toLowerCase().includes('_men_1000') &&
        !f.toLowerCase().includes('women')
    );

    const categorization = {
        wc1: { a: [], b: [] },
        wc2: { a: [], b: [] },
        unknown: []
    };

    menFiles.forEach(f => {
        const isDivA = f.includes('_a-') || f.includes('_a_');
        const isDivB = f.includes('_b-') || f.includes('_b_');

        // Date check
        const dateMatch = f.match(/202511(\d{2})/);
        let wc = 'unknown';
        if (dateMatch) {
            const day = parseInt(dateMatch[1]);
            if (day >= 14 && day <= 17) wc = 'wc1';
            else if (day >= 21 && day <= 24) wc = 'wc2';
        }

        if (wc !== 'unknown') {
            if (isDivA) categorization[wc].a.push(f);
            else if (isDivB) categorization[wc].b.push(f);
            else categorization.unknown.push(f);
        } else {
            categorization.unknown.push(f);
        }
    });

    console.log('--- Men 1000m File Verification ---');
    console.log(`Total Files Found: ${menFiles.length}`);

    console.log('\nWC1 (Salt Lake City):');
    console.log(`  Div A: ${categorization.wc1.a.length} file(s) -> ${categorization.wc1.a.join(', ')}`);
    console.log(`  Div B: ${categorization.wc1.b.length} file(s) -> ${categorization.wc1.b.join(', ')}`);

    console.log('\nWC2 (Calgary):');
    console.log(`  Div A: ${categorization.wc2.a.length} file(s) -> ${categorization.wc2.a.join(', ')}`);
    console.log(`  Div B: ${categorization.wc2.b.length} file(s) -> ${categorization.wc2.b.join(', ')}`);

    if (categorization.unknown.length > 0) {
        console.log('\nUnknown/Uncategorized:');
        categorization.unknown.forEach(f => console.log(`  ${f}`));
    }
}

verifyMen1000Files();
