const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('public/data.json', 'utf8'));
    console.log('--- Team USA Quota Summary ---');

    let totalQuotas = 0;
    const summary = [];

    // Define a nice order for display
    const orderedKeys = [
        '500m-women', '500m-men',
        '1000m-women', '1000m-men',
        '1500m-women', '1500m-men',
        '3000m-women', '5000m-men',
        '5000m-women', '10000m-men',
        'Mass Start-women', 'Mass Start-men',
        'Team Pursuit-women', 'Team Pursuit-men'
    ];

    orderedKeys.forEach(key => {
        const eventData = data.soqc[key];
        if (!eventData) return;

        const usaQualified = eventData.quotas.qualified.filter(s => s.country === 'USA');
        const count = usaQualified.length;
        totalQuotas += count;

        const displayName = key.replace('-', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());

        let details = '';
        if (count > 0) {
            details = `(${usaQualified.map(s => s.name).join(', ')})`;
        } else {
            // Check reserve
            const usaReserve = eventData.quotas.reserve.filter(s => s.country === 'USA');
            if (usaReserve.length > 0) {
                const bestReserve = usaReserve[0];
                const reallocIndex = eventData.quotas.reallocationList.findIndex(s => s.name === bestReserve.name && s.country === 'USA');
                details = `[No Quotas - Best Reserve: ${bestReserve.name} #${reallocIndex + 1}]`;
            } else {
                details = `[No Quotas]`;
            }
        }

        console.log(`${displayName.padEnd(20)}: ${count} ${details}`);
    });

    console.log('------------------------------');
    console.log(`TOTAL QUOTAS        : ${totalQuotas}`);

} catch (e) {
    console.error("Error:", e);
}
