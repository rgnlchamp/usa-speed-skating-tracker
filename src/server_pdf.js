const express = require('express');
const path = require('path');
const store = require('./data/store_pdf'); // Using PDF-based store

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/data', (req, res) => {
    res.json(store.getState());
});

app.post('/api/refresh', async (req, res) => {
    if (store.getState().isUpdating) {
        return res.status(409).json({ message: 'Update already in progress' });
    }

    // Start update
    store.updateData().then(() => {
        console.log("PDF data loaded successfully!");
    });

    res.json({ message: 'Loading PDF data...' });
});

// Start server and load data
app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Loading PDF data on startup...');

    // Load PDF data automatically on startup
    await store.updateData();
    console.log('Ready!');
});
