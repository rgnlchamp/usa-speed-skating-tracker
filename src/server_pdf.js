const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load pre-generated data
let cachedState = null;
const dataPath = path.join(__dirname, '../public/data.json');

function loadData() {
    if (!cachedState) {
        console.log('Loading pre-generated data from public/data.json...');
        const data = fs.readFileSync(dataPath, 'utf8');
        cachedState = JSON.parse(data);
        console.log('✅ Data loaded successfully!');
    }
    return cachedState;
}

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/data', (req, res) => {
    try {
        const state = loadData();
        res.json(state);
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Using pre-generated static data');
    loadData(); // Preload on startup
    console.log('Ready!');
});
