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

                // Cell structure: [rank, "Name Country", ...points columns..., total]
                const rankText = cells[0]?.textContent.trim();
                const nameCountryText = cells[1]?.textContent.trim();
                const totalPointsText = cells[cells.length - 1]?.textContent.trim();

                // Extract country code (last 3 uppercase letters) from name field
                // Format is typically: "FirstName  LastName  XXX" where XXX is country code
                const match = nameCountryText.match(/^(.+?)\s+([A-Z]{3})$/);

                let name = nameCountryText;
                let country = '';

                if (match) {
                    name = match[1].trim();
                    country = match[2];
                }

                const totalPoints = parseInt(totalPointsText) || 0;
                const rank = parseInt(rankText) || 0;

                return {
                    rank: rank,
                    name: name,
                    country: country,
                    totalPoints: totalPoints
                };
            }).filter(row => row && row.name && row.country && row.totalPoints > 0);
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
    scrapeMassStartStandings('M').then(data => {
        console.log('\n=== Men Mass Start Standings (Top 24 = Olympic Qualifiers) ===\n');
        data.slice(0, 30).forEach((s, i) => {
            const qualifier = i < 24 ? '✓' : ' ';
            console.log(`${qualifier} ${String(s.rank).padStart(2)}. ${s.name.padEnd(30)} ${s.country.padEnd(3)} ${String(s.totalPoints).padStart(3)} pts`);
        });

        console.log(`\n📊 Summary:`);
        console.log(`   Total skaters: ${data.length}`);
        console.log(`   Olympic qualifiers (Top 24): ${Math.min(data.length, 24)}`);

        const usa = data.filter(s => s.country === 'USA');
        console.log(`   USA skaters: ${usa.length}`);
        usa.forEach(s => console.log(`      - ${s.name} (${s.totalPoints} pts)`));
    }).catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
