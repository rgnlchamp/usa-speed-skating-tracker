const puppeteer = require('puppeteer');

async function scrapeMassStartData() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        console.log('Navigating to ISU Mass Start standings...');
        await page.goto('https://live.isuresults.eu/worldcup/WC_2026_F_MS/standings', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for the table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Extract the table data
        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 3) return null;

                return {
                    rank: cells[0]?.textContent.trim(),
                    name: cells[1]?.textContent.trim(),
                    country: cells[2]?.textContent.trim(),
                    points: cells[3]?.textContent.trim(),
                };
            }).filter(Boolean);
        });

        console.log('\n=== Women Mass Start Standings ===');
        console.log(`Found ${data.length} skaters\n`);

        data.slice(0, 30).forEach(skater => {
            console.log(`${skater.rank.padStart(3)}. ${skater.name.padEnd(30)} ${skater.country.padEnd(4)} ${skater.points.padStart(4)} pts`);
        });

        await browser.close();

        // Return the data for further processing
        return data;

    } catch (error) {
        console.error('Error scraping data:', error.message);
        await browser.close();
        throw error;
    }
}

// Run the scraper
scrapeMassStartData()
    .then(data => {
        console.log(`\n✅ Successfully scraped ${data.length} skaters`);
        console.log(`\nTop 24 qualify for Olympics (current qualification rule)`);
    })
    .catch(err => {
        console.error('Failed:', err.message);
        process.exit(1);
    });
