const { scrapeMassStartStandings } = require('./src/data/mass_start_scraper');

async function test() {
    const women = await scrapeMassStartStandings('F');

    console.log(JSON.stringify({
        event: 'Mass Start - Women',
        total: women.length,
        qualifiers: women.slice(0, 24),
        reserves: women.slice(24, 32)
    }, null, 2));
}

test();
