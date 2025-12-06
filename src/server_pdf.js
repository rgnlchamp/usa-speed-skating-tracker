const express = require('express');
const path = require('path');
const fs = require('fs');
const store = require('./data/store_pdf');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Load pre-generated data
const dataPath = path.join(__dirname, '../public/data.json');
let cachedState = null;

function loadData() {
    try {
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            cachedState = JSON.parse(data);
            console.log('✅ Loaded pre-generated data');
        } else {
            console.log('⚠️ No pre-generated data found at', dataPath);
        }
    } catch (e) {
        console.error('Error loading data:', e);
    }
    return cachedState;
}

// Initial load
loadData();

// Trigger background update on start
store.updateData().then(() => {
    cachedState = store.getState();
    console.log('✅ Background data update complete');
}).catch(err => {
    console.error('⚠️ Background update failed:', err);
});

// API Routes
app.get('/api/data', (req, res) => {
    const data = cachedState || store.getState();
    if (data) {
        res.json(data);
    } else {
        res.status(503).json({ error: 'Data not available yet' });
    }
});

app.post('/api/refresh', async (req, res) => {
    console.log("Refreshing data...");
    try {
        await store.updateData();
        const newState = store.getState();
        cachedState = newState;

        try {
            fs.writeFileSync(dataPath, JSON.stringify(newState, null, 2));
            console.log("✅ Data saved to disk");
        } catch (e) {
            console.warn("⚠️ Could not save to disk (readonly fs?), but memory updated:", e.message);
        }

        res.json({
            message: 'Data refreshed (memory updated)',
            timestamp: newState.lastUpdated,
            note: 'If on Vercel, this update is ephemeral.'
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
