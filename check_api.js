const http = require('http');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const soqc = json.soqc['500m-women'];

            if (!soqc) {
                console.log('No SOQC data for 500m-women');
                return;
            }

            const brooklyn = soqc.points.find(p => p.name.includes('Brooklyn'));
            if (brooklyn) {
                console.log('Found Brooklyn in API response:');
                console.log(JSON.stringify(brooklyn, null, 2));
            } else {
                console.log('Brooklyn NOT found in API response');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err);
});
