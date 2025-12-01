const puppeteer = require('puppeteer');

const BASE_URL = 'https://speedskatingresults.com';
const CALENDAR_URL = 'https://speedskatingresults.com/index.php?p=12&y=2025&c=2';

async function getBrowser() {
    return await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
}

/**
 * Discover World Cup events from the 2025/2026 season calendar page
 * @returns {Array} List of World Cup events with IDs and titles
 */
async function discoverWorldCups() {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        console.log(`Discovering World Cups from calendar...`);
        await page.goto(CALENDAR_URL, { waitUntil: 'networkidle0', timeout: 10000 });

        const events = await page.evaluate((baseUrl) => {
            const links = Array.from(document.querySelectorAll('a'));
            const wcLinks = links.filter(a => a.textContent.includes('ISU Speed Skating World Cup'));

            return wcLinks.map(link => {
                const href = link.getAttribute('href');
                const title = link.textContent.trim();

                // Extract event ID from href (e.g., "index.php?p=2&e=30774" -> "30774")
                const match = href.match(/e=(\d+)/);
                const id = match ? match[1] : null;

                return id ? { id, title, url: baseUrl + '/' + href } : null;
            }).filter(e => e !== null);
        }, BASE_URL);

        console.log(`  Found ${events.length} World Cup events`);
        return events;

    } catch (error) {
        console.error(`Error discovering World Cups:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

/**
 * Get all races for an event with gender context
 */
async function getEventRaces(eventId) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const eventUrl = `${BASE_URL}/index.php?p=2&e=${eventId}`;

    try {
        console.log(`Fetching event: ${eventUrl}`);
        await page.goto(eventUrl, { waitUntil: 'networkidle0', timeout: 10000 });

        const races = await page.evaluate((baseUrl) => {
            const results = [];
            let currentGender = 'unknown';

            // Walk through all elements to find gender headings and race links
            const allElements = document.body.querySelectorAll('*');
            allElements.forEach(el => {
                const text = el.textContent.trim();

                // Detect gender headings (H2 or H3 tags with "Women" or "Men")
                if ((el.tagName === 'H3' || el.tagName === 'H2') && text.length < 20) {
                    if (text.toLowerCase().includes('women')) {
                        currentGender = 'women';
                    } else if (text.toLowerCase() === 'men') {
                        currentGender = 'men';
                    }
                }

                // Extract race links (links with p=3 in href)
                if (el.tagName === 'A' && el.href.includes('p=3')) {
                    const distance = text.trim();
                    if (distance.match(/^\d+m$/) || distance === 'Mass Start') {
                        results.push({
                            url: el.href,
                            distance,
                            gender: currentGender,
                            name: `${distance} ${currentGender.charAt(0).toUpperCase() + currentGender.slice(1)}`
                        });
                    }
                }
            });

            return results;
        }, BASE_URL);

        console.log(`  Found ${races.length} races`);
        return races;

    } catch (error) {
        console.error(`Error fetching event races:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

/**
 * Get results for a specific race
 */
async function getRaceResults(raceUrl) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        console.log(`    Fetching results: ${raceUrl.substring(40)}`);
        await page.goto(raceUrl, { waitUntil: 'networkidle0', timeout: 10000 });

        const results = await page.evaluate(() => {
            const table = document.querySelector('table');
            if (!table) return null;

            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 4) return null;

                return {
                    rank: cells[0]?.textContent.trim() || '',
                    name: cells[1]?.textContent.trim() || '',
                    country: cells[3]?.textContent.trim() || '', // Fixed: country is 4th column (index 3)
                    time: cells[4]?.textContent.trim() || '', // Fixed: time is 5th column (index 4)
                    points: parseInt(cells[cells.length - 1]?.textContent.trim()) || 0
                };
            }).filter(r => r !== null && r.name);
        });

        console.log(`      → ${results ? results.length : 0} skaters`);
        return results || [];

    } catch (error) {
        console.error(`Error fetching race results:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

/**
 * Fetch all data for an event
 */
async function fetchEventData(eventId) {
    const races = await getEventRaces(eventId);
    const raceResults = [];

    for (const race of races) {
        const results = await getRaceResults(race.url);
        raceResults.push({
            ...race,
            results
        });
    }

    return raceResults;
}

// Test script
if (require.main === module) {
    (async () => {
        console.log("=== Testing Auto-Discovery & Scraping ===\n");

        // Discover World Cups
        const worldCups = await discoverWorldCups();
        if (worldCups.length === 0) {
            console.error("No World Cups found!");
            return;
        }

        console.log("\n=== DISCOVERED WORLD CUPS ===");
        worldCups.forEach(wc => console.log(`  ${wc.title} (ID: ${wc.id})`));

        // Test with first event
        const testEvent = worldCups[0];
        console.log(`\n=== TESTING WITH: ${testEvent.title} ===\n`);

        const data = await fetchEventData(testEvent.id);

        console.log("\n=== SUMMARY ===");
        const byGender = {};
        data.forEach(race => {
            if (!byGender[race.gender]) byGender[race.gender] = [];
            byGender[race.gender].push(`${race.distance}: ${race.results.length} skaters`);
        });

        Object.keys(byGender).forEach(gender => {
            console.log(`\n${gender.toUpperCase()}:`);
            byGender[gender].forEach(line => console.log(`  ${line}`));
        });

        if (data.length > 0 && data[0].results.length > 0) {
            console.log("\n=== SAMPLE (first race) ===");
            const sample = data[0];
            console.log(`${sample.name}`);
            console.log("Top 3:");
            sample.results.slice(0, 3).forEach(r => {
                console.log(`  ${r.rank}. ${r.name} (${r.country}) - ${r.time}`);
            });
        }
    })();
}

module.exports = { discoverWorldCups, getEventRaces, getRaceResults, fetchEventData };
