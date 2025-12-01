const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/api/data', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const keys = Object.keys(json.soqc || {});
            console.log('SOQC Keys:', keys);
            fs.writeFileSync('debug_api_keys.txt', JSON.stringify(keys, null, 2));
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    });
}).on('error', (err) => {
    console.error('Error fetching data:', err);
});
