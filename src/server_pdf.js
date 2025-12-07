const express = require('express');
const path = require('path');
const fs = require('fs');
const store = require('./data/store_pdf');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Load pre-generated data - try multiple paths for Vercel compatibility
const possiblePaths = [
    path.join(__dirname, '../public/data.json'),
    path.join(process.cwd(), 'public/data.json'),
    path.join(process.cwd(), 'data.json'),
];
let cachedState = null;

function loadData() {
    console.log('🔍 Attempting to load data from multiple paths...');
    console.log('__dirname:', __dirname);
    console.log('process.cwd():', process.cwd());

    for (const dataPath of possiblePaths) {
        try {
            console.log(`  Trying: ${dataPath}`);
            if (fs.existsSync(dataPath)) {
                const data = fs.readFileSync(dataPath, 'utf8');
                cachedState = JSON.parse(data);
                console.log(`✅ Successfully loaded data from: ${dataPath}`);
                console.log(`   Data size: ${(data.length / 1024).toFixed(2)} KB`);
                console.log(`   Events: ${cachedState.events?.length || 0}`);
                console.log(`   SOQC distances: ${Object.keys(cachedState.soqc || {}).length}`);
                return cachedState;
            } else {
                console.log(`  ❌ Path not found: ${dataPath}`);
            }
        } catch (e) {
            console.error(`  ⚠️ Error loading from ${dataPath}:`, e.message);
        }
    }

    console.error('❌ Failed to load data from any path');
    return null;
}

// Initial load
const dataLoaded = loadData();

// Only trigger background update if no data was loaded from file
// This prevents slow PDF parsing on Vercel when we have pre-generated data
if (!dataLoaded || !cachedState || !cachedState.soqc || Object.keys(cachedState.soqc).length === 0) {
    console.log('⚠️ No pre-generated data found, starting background update from PDFs...');
    store.updateData().then(() => {
        cachedState = store.getState();
        console.log('✅ Background data update complete');
    }).catch(err => {
        console.error('⚠️ Background update failed:', err);
    });
} else {
    console.log('✅ Using pre-generated data, skipping background update');
    console.log(`   Data has ${Object.keys(cachedState.soqc).length} distances`);
}

// API Routes
app.get('/api/data', (req, res) => {
    const data = cachedState || store.getState();
    if (data && data.soqc && Object.keys(data.soqc).length > 0) {
        res.json(data);
    } else {
        console.error('⚠️ No valid data available in /api/data');
        console.error('  cachedState exists:', !!cachedState);
        console.error('  cachedState.soqc exists:', !!cachedState?.soqc);
        console.error('  SOQC keys:', Object.keys(cachedState?.soqc || {}));

        // Return debug info instead of generic error
        res.status(503).json({
            error: 'Data not available yet',
            debug: {
                hasCachedState: !!cachedState,
                hasSOQC: !!cachedState?.soqc,
                soqcKeys: Object.keys(cachedState?.soqc || {}),
                eventsCount: cachedState?.events?.length || 0,
                cwd: process.cwd(),
                dirname: __dirname,
                possiblePaths,
                filesInPublic: (() => {
                    try {
                        const publicPath = path.join(process.cwd(), 'public');
                        return fs.existsSync(publicPath) ? fs.readdirSync(publicPath) : 'public dir not found';
                    } catch (e) {
                        return `error: ${e.message}`;
                    }
                })()
            }
        });
    }
});

app.post('/api/refresh', async (req, res) => {
    console.log("Refreshing data...");
    try {
        await store.updateData();
        const newState = store.getState();
        cachedState = newState;

        // Try to save to each possible path
        let savedToAny = false;
        for (const tryPath of possiblePaths) {
            try {
                const dir = path.dirname(tryPath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(tryPath, JSON.stringify(newState, null, 2));
                console.log(`✅ Data saved to: ${tryPath}`);
                savedToAny = true;
                break; // Stop after first successful save
            } catch (e) {
                console.warn(`⚠️ Could not save to ${tryPath}:`, e.message);
            }
        }

        res.json({
            message: savedToAny ? 'Data refreshed and saved' : 'Data refreshed (memory only)',
            timestamp: newState.lastUpdated,
            note: savedToAny ? 'Data saved successfully' : 'Read-only filesystem - data in memory only'
        });
    } catch (e) {
        console.error("Error regenerating data:", e);
        res.status(500).json({ error: 'Failed to refresh data: ' + e.message });
    }
});

app.get('/api/debug', (req, res) => {
    const debugInfo = {
        cwd: process.cwd(),
        filesInCwd: [],
        dataPath: path.join(process.cwd(), 'data'),
        pdfPath: path.join(process.cwd(), 'data', 'pdf'),
        filesInPdf: [],
        timestamp: cachedState?.lastUpdated
    };

    try { debugInfo.filesInCwd = fs.readdirSync(process.cwd()); } catch (e) { }
    try {
        if (fs.existsSync(debugInfo.pdfPath)) {
            debugInfo.filesInPdf = fs.readdirSync(debugInfo.pdfPath);
            debugInfo.pdfCount = debugInfo.filesInPdf.length;
        } else {
            debugInfo.error = 'PDF directory not found';
        }
    } catch (e) {
        debugInfo.error = e.message;
    }

    res.json(debugInfo);
});

app.get('/api/check-pdf-files', (req, res) => {
    try {
        const dir = path.join(__dirname, '../data/pdf');
        if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            res.json({ count: files.length, files });
        } else {
            res.json({ error: 'Directory not found', path: dir });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/check-skater/:name', (req, res) => {
    const s = cachedState || store.getState();
    if (!s || !s.soqc) return res.status(503).json({ error: 'No data' });

    const nameQuery = req.params.name.toLowerCase();
    const results = [];

    Object.keys(s.soqc).forEach(key => {
        const list = s.soqc[key];
        const p = list.points?.find(x => x.name.toLowerCase().includes(nameQuery));
        const t = list.times?.find(x => x.name.toLowerCase().includes(nameQuery));

        if (p || t) {
            results.push({
                event: key,
                pointsEntry: p,
                timesEntry: t,
                reserves: list.quotas?.reserve?.filter(r => r.name.toLowerCase().includes(nameQuery))
            });
        }
    });

    res.json(results);
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
