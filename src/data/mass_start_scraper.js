const puppeteer = require('puppeteer');

/**
 * Scrape Mass Start standings from ISU Live Results
 * @param {string} gender - 'F' for women or 'M' for men
 * @returns {Array} Array of skater objects with rank, name, country, and total points
 */
async function scrapeMassStartStandings(gender = 'F') {
    const url = `https://live.isuresults.eu/worldcup/WC_2026_${gender}_MS/standings`;
    console.log(`Fetching ${gender === 'F' ? 'Women' : 'Men'}'s Mass Start standings from ISU...`);

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

        // Wait for table to load
        await page.waitForSelector('table', { timeout: 10000 });

        // Extract data from the table
        const standings = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 4) return null;

                // Get the last cell which should contain total points
                const pointsText = cells[cells.length - 1]?.textContent.trim();
                const totalPoints = parseInt(pointsText) || 0;

                return {
                    rank: parseInt(cells[0]?.textContent.trim()) || 0,
                    name: cells[1]?.textContent.trim(),
                    country: cells[2]?.textContent.trim(),
                    totalPoints: totalPoints
                };
            }).filter(row => row && row.name && row.totalPoints > 0);
        });

        await browser.close();

        console.log(`✅ Scraped ${standings.length} skaters`);
        return standings;

    } catch (error) {
        await browser.close();
        console.error(`Error scraping Mass Start data:`, error.message);
        return [];
    }
}

module.exports = { scrapeMassStartStandings };

// If run directly, test the scraper
if (require.main === module) {
    scrapeMassStartStandings('F').then(data => {
        console.log('\n=== Women Mass Start Standings (Top 24 = Olympic Qualifiers) ===\n');
        data.slice(0, 30).forEach((s, i) => {
            const qualifier = i < 24 ? '✓' : ' ';
            console.log(`${qualifier} ${String(s.rank).padStart(2)}. ${s.name.padEnd(30)} ${s.country.padEnd(3)} ${String(s.totalPoints).padStart(3)} pts`);
        });

        console.log(`\n📊 Summary:`);
        console.log(`   Total skaters: ${data.length}`);
        console.log(`   Olympic qualifiers (Top 24): ${Math.min(data.length, 24)}`);
    }).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
