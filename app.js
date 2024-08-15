const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());

const spacesFilePath = path.join(__dirname, 'data', 'spaces.json');
let spaces = JSON.parse(fs.readFileSync(spacesFilePath, 'utf8'));

// Route to get all spaces or filter by location and max price
app.get('/spaces', (req, res) => {
    const { location, maxPrice } = req.query;

    let results = spaces;

    // Filter by location
    if (location) {
        results = results.filter(space =>
            space.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    // Filter by maximum price
    if (maxPrice) {
        results = results.filter(space => space.price <= parseFloat(maxPrice));
    }

    res.json(results);
});

app.get('/spaces/:id', (req, res) => {
    const spaceId = parseInt(req.params.id);
    const space = spaces.find(s => s.id === spaceId);

    if (!space) {
        return res.status(404).json({ message: 'Space not found' });
    }

    res.json(space);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});