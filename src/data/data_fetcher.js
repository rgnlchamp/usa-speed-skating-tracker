const puppeteer = require('puppeteer');

const BASE_URL = 'https://live.isuresults.eu';

// Hardcoded World Cup Events for 2025/2026 Season
const WORLD_CUPS = [
    { id: '2026_USA_0001', title: 'World Cup #1 - Salt Lake City', date: '14-16 Nov 2025' },
    // { id: '2026_CAN_0001', title: 'World Cup #2 - Calgary', date: '21-23 Nov 2025' },
    // { id: '2026_NED_0001', title: 'World Cup #3 - Heerenveen', date: '05-07 Dec 2025' },
    // { id: '2026_NOR_0001', title: 'World Cup #4 - Hamar', date: '12-14 Dec 2025' }
];

// Test Event (Real 2025/2026 Season Event)
const TEST_EVENT_ID = '2026_USA_0001';

async function getBrowser() {
    return await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
}

async function getEventSchedule(eventId) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const scheduleUrl = `${BASE_URL}/events/${eventId}/schedule`;

    try {
        console.log(`Navigating to ${scheduleUrl}`);
        await page.goto(scheduleUrl, { waitUntil: 'networkidle0' });

        // Wait for Angular to render the schedule
        await new Promise(r => setTimeout(r, 3000));

        const competitions = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.row.schedule-item'));

            return items.map(item => {
                const titleEl = item.querySelector('.title');
                const resultLink = item.querySelector('a[href*="/results"]');

                if (!titleEl || !resultLink) return null;

                const name = titleEl.innerText.trim();
                const href = resultLink.getAttribute('href');

                // href format: /events/{eventId}/competition/{compId}/results
                const parts = href.split('/competition/');
                if (parts.length < 2) return null;
                const compId = parts[1].split('/')[0];

                return {
                    id: compId,
                    name: name,
                    url: resultLink.href
                };
            }).filter(c => c !== null);
        });

        // Remove duplicates
        const uniqueCompetitions = [];
        const seenIds = new Set();
        for (const comp of competitions) {
            if (!seenIds.has(comp.id)) {
                seenIds.add(comp.id);
                uniqueCompetitions.push(comp);
            }
        }

        console.log(`Found ${uniqueCompetitions.length} competitions for event ${eventId}.`);
        return uniqueCompetitions;

    } catch (error) {
        console.error(`Error fetching schedule for ${eventId}:`, error);
        return [];
    } finally {
        await browser.close();
    }
}

async function getCompetitionResults(eventId, competitionId) {
    const browser = await getBrowser();
    const page = await browser.newPage();
    const resultsUrl = `${BASE_URL}/events/${eventId}/competition/${competitionId}/results`;

    try {
        console.log(`Navigating to ${resultsUrl}`);
        await page.goto(resultsUrl, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 5000)); // Wait for table

        const data = await page.evaluate(() => {
            const table = document.querySelector('table.results');
            if (!table) return null;

            // Get headers
            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());

            // Get rows with innerHTML for name cell to parse country correctly
            const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return cells.map((td, index) => {
                    // For name column (usually index 2), get innerHTML to preserve structure
                    if (index === 2) return td.innerHTML;
                    return td.innerText.trim();
                });
            });

            return { headers, rows };
        });

        if (!data) {
            console.log("No results table found.");
            return null;
        }

        const results = data.rows.map(row => {
            // Name cell is now HTML. Usually: "Name <span...>NAT</span>" or "Name <br> NAT"
            // Let's parse it.
            const nameHtml = row[2] || "";
            let name = "Unknown";
            let country = "UNK";

            // Clean HTML tags first to get text with spaces, but replace br with newline
            const text = nameHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ' ').trim();

            // Try to find country at the end
            const parts = text.split('\n');
            if (parts.length > 1) {
                name = parts[0].trim();
                country = parts[parts.length - 1].trim();
            } else {
                // Regex for "Name NAT"
                const match = text.match(/(.*)\s+([A-Z]{3})$/);
                if (match) {
                    name = match[1].trim();
                    country = match[2];
                } else {
                    name = text;
                }
            }

            // Clean up name (remove extra spaces)
            name = name.replace(/\s+/g, ' ').trim();
            // Clean up country (ensure it's 3 chars)
            if (country.length > 3) {
                const m = country.match(/([A-Z]{3})/);
                if (m) country = m[1];
            }

            return {
                rank: row[0],
                skater: { name, country },
                time: row[3],
                points: row[row.length - 1] // Points usually last
            };
        });

        return results;

    } catch (error) {
        console.error(`Error fetching results for ${eventId}/${competitionId}:`, error);
        return null;
    } finally {
        await browser.close();
    }
}

// Test function
if (require.main === module) {
    (async () => {
        console.log("Testing with event:", TEST_EVENT_ID);
        const competitions = await getEventSchedule(TEST_EVENT_ID);
        console.log("Competitions:", JSON.stringify(competitions, null, 2));

        if (competitions.length > 0) {
            const firstComp = competitions[0];
            console.log(`Fetching results for ${firstComp.name} (ID: ${firstComp.id})...`);
            const results = await getCompetitionResults(TEST_EVENT_ID, firstComp.id);
            console.log("Results Sample:", JSON.stringify(results ? results.slice(0, 3) : "No results", null, 2));
        }
    })();
}

module.exports = { WORLD_CUPS, getEventSchedule, getCompetitionResults };
