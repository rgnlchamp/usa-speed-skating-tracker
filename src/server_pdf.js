const express = require('express');
const path = require('path');
const fs = require('fs');
const store = require('./data/store_pdf');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Initialize data on startup
store.updateData().then(() => {
    console.log('Initial data load complete');
});

// API Routes
app.get('/api/data', (req, res) => {
    res.json(store.getState());
});

app.post('/api/refresh', async (req, res) => {
    if (store.getState().isUpdating) {
        return res.status(409).json({ message: 'Update already in progress' });
    }

    try {
        // Start update
        store.updateData().then(() => {
            console.log("Update finished via API trigger");
        });
        res.json({ message: 'Update started' });
    } catch (error) {
        console.error('Error triggering update:', error);
        res.status(500).json({ error: 'Failed to trigger update' });
    }
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
