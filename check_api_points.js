const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function checkAPI() {
    try {
        const res = await fetch('http://localhost:3000/api/data');
        const data = await res.json();

        const event = data.soqc['10000m-men'];

        console.log('\n=== Men 10000m - Times Qualifiers (from API) ===');
        const timesQualifiers = event.quotas.qualified.filter(s => s.method === 'Times');
        timesQualifiers.forEach((s, i) => {
            console.log(`${i + 1}. ${s.name} (${s.country}) - Time: ${s.bestTime}, Points: ${s.totalPoints}`);
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkAPI();
