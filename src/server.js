const express = require('express');
const path = require('path');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/data', (req, res) => {
    res.json(store.getState());
});

app.post('/api/refresh', async (req, res) => {
    // Trigger update in background (or await if fast enough - scraping is slow so background)
    if (store.getState().isUpdating) {
        return res.status(409).json({ message: 'Update already in progress' });
    }

    // Start update
    store.updateData().then(() => {
        console.log("Update finished via API trigger");
    });

    res.json({ message: 'Update started' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
