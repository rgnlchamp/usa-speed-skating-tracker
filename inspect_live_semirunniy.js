const https = require('https');

const url = 'https://n-39syukc8x-matt-ks-projects-09461048.vercel.app/api/data';

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

https.get(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const menLong = json.soqc['5000m-men'];

            if (!menLong) {
                console.log('No 5000m-men data found');
                return;
            }

            console.log('--- Checking 5000m-men SOQC ---');

            // Check Points Qualifiers
            const pointsSkater = menLong.quotas.qualified.find(q => q.name.includes('Semirunniy') || q.name.includes('Vladimir'));
            if (pointsSkater) {
                console.log('Found in Qualified (Points/Times mixed):');
                console.log(JSON.stringify(pointsSkater, null, 2));
            } else {
                console.log('Not found in Qualified list');
                // Check raw points list if available
                if (menLong.points) {
                    const p = menLong.points.find(x => x.name.includes('Semirunniy'));
                    if (p) {
                        console.log('Found in Raw Points List:', JSON.stringify(p, null, 2));
                    }
                }
            }

            // Check Reserve
            const reserveSkater = menLong.quotas.reserve.find(q => q.name.includes('Semirunniy'));
            if (reserveSkater) {
                console.log('Found in Reserve:', JSON.stringify(reserveSkater, null, 2));
            }

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Received data sample:', data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
