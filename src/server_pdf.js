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

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
