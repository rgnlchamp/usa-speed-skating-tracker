const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));
    console.log("Checking Next Reallocation in public/data.json:");
    const keys = Object.keys(data.soqc);

    // Sort keys for consistent output
    keys.sort();

    keys.forEach(k => {
        const q = data.soqc[k].quotas;
        const next = q.nextReallocation;
        const reserveCount = q.reserve.length;
        const qualifiedCount = q.qualified.length;

        console.log(`\nEvent: ${k}`);
        console.log(`  Qualified: ${qualifiedCount}`);
        console.log(`  Reserve Size: ${reserveCount}`);

        if (next) {
            console.log(`  Target Next Reallocation: ${next.name} (${next.country})`);
            // Check if this matches our logic (priority to 0 quota NOC)
            // We need to count quotas from qualified list to verify?
            // Let's just print it for visual confirmation.
        } else {
            console.log(`  Target Next Reallocation: None`);
        }

        // Sanity check: is next reallocation in the reserve list?
        if (next) {
            const inReserve = q.reserve.find(r => r.name === next.name && r.country === next.country);
            if (inReserve) {
                console.log(`  ✅ Next reallocation is present in reserve list.`);
            } else {
                console.log(`  ❌ WARNING: Next reallocation NOT found in reserve list!`);
            }
        }
    });

} catch (e) {
    console.error("Error reading data:", e);
}
