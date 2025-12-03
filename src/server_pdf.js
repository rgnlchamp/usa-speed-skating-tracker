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

// API Routes
app.get('/api/data', (req, res) => {
    const data = loadData();
    if (data) {
        res.json(data);
    } else {
        res.status(503).json({ error: 'Data not available yet' });
    }
});

app.post('/api/refresh', async (req, res) => {
    // In this static build model, refresh just reloads the file
    loadData();
    res.json({ message: 'Data reloaded from disk' });
});

app.get('/api/debug', (req, res) => {
    const fs = require('fs');
    const debugInfo = {
        cwd: process.cwd(),
        filesInCwd: fs.readdirSync(process.cwd()),
        dataPath: path.join(process.cwd(), 'data'),
        pdfPath: path.join(process.cwd(), 'data', 'pdf'),
        filesInPdf: []
    };

    try {
        if (fs.existsSync(debugInfo.pdfPath)) {
            debugInfo.filesInPdf = fs.readdirSync(debugInfo.pdfPath);
        } else {
            debugInfo.error = 'PDF directory not found';
        }
    } catch (e) {
        debugInfo.error = e.message;
    }

    res.json(debugInfo);
});

// Start server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
