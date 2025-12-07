const puppeteer = require('puppeteer');

async function debugMassStartPage(gender = 'M') {
    const url = `https://live.isuresults.eu/worldcup/WC_2026_${gender}_MS/standings`;
    console.log(`Debugging URL: ${url}\n`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Check if table exists
        const tableExists = await page.evaluate(() => {
            return !!document.querySelector('table');
        });
        console.log('Table exists:', tableExists);

        // Get table structure
        const tableInfo = await page.evaluate(() => {
            const tables = document.querySelectorAll('table');
            return Array.from(tables).map((table, idx) => {
                const rows = table.querySelectorAll('tbody tr');
                const firstRow = rows[0];
                if (!firstRow) return { index: idx, rows: 0, cells: 0 };

                const cells = firstRow.querySelectorAll('td');
                return {
                    index: idx,
                    rowCount: rows.length,
                    cellCount: cells.length,
                    firstRowCells: Array.from(cells).map(c => c.textContent.trim())
                };
            });
        });

        console.log('\nTable info:', JSON.stringify(tableInfo, null, 2));

        // Try to extract data from first table with data
        const standings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            console.log('Found rows:', rows.length);

            return rows.slice(0, 5).map(row => {
                const cells = row.querySelectorAll('td');
                const cellData = Array.from(cells).map(c => c.textContent.trim());
                return {
                    cellCount: cells.length,
                    cells: cellData
                };
            });
        });

        console.log('\nFirst 5 rows:', JSON.stringify(standings, null, 2));

        await browser.close();

    } catch (error) {
        await browser.close();
        console.error('Error:', error.message);
    }
}

debugMassStartPage('M').then(() => {
    console.log('\n--- Now trying Women ---\n');
    return debugMassStartPage('F');
});
