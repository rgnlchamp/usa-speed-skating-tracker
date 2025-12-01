const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Use the real event ID
    const url = 'https://live.isuresults.eu/events/2026_USA_0001/schedule';

    console.log(`Navigating to ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Wait for content
    await new Promise(r => setTimeout(r, 5000));

    // Dump the main content
    const html = await page.evaluate(() => {
        // Try to find the main container
        const container = document.querySelector('app-schedule') || document.body;
        return container.innerHTML;
    });

    const fs = require('fs');
    fs.writeFileSync('schedule_dump.html', html);
    console.log("Dumped HTML to schedule_dump.html");

    await browser.close();
})();
