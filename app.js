const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());

// Serving static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Paths to JSON files
const peopleFilePath = path.join(__dirname, 'data', 'people.json');
const spacesFilePath = path.join(__dirname, 'data', 'spaces.json');
const coworkingFilePath = path.join(__dirname, 'data', 'coworking.json'); 

// Load data from JSON files
let people = JSON.parse(fs.readFileSync(peopleFilePath, 'utf8'));
let spaces = JSON.parse(fs.readFileSync(spacesFilePath, 'utf8'));

// Redirect to the main page '1.1FirstPage.html'
app.get('/', (req, res) => {
    res.redirect('/1.1FirstPage.html');
});

// Route to get all spaces or filter by maximum price
app.get('/spaces', (req, res) => {
    const { maxPrice } = req.query;

    let results = spaces.Spaces;

    // Filter by maximum price
    if (maxPrice) {
        results = results.filter(space => 
            parseFloat(space.Booking["Pricing (per month)"].replace('$', '')) <= parseFloat(maxPrice)
        );
    }

    res.json({ Spaces: results });
});

// Route to get a space by ID
app.get('/spaces/:id', (req, res) => {
    const spaceId = parseInt(req.params.id);
    const space = spaces.Spaces.find(s => s.id === spaceId);

    if (!space) {
        return res.status(404).json({ message: 'Space not found' });
    }

    res.json(space);
});

// Route to get all people
app.get('/people', (req, res) => {
    res.json(people);
});

// Route to get a person by ID
app.get('/people/:id', (req, res) => {
    const personId = parseInt(req.params.id);
    const person = people.People.find(p => p.id === personId);

    if (!person) {
        return res.status(404).json({ message: 'Person not found' });
    }

    res.json(person);
});

// Route to add a new person and a new space
app.post('/add', (req, res) => {
    const { name, role, email, spaceType, capacity, bookingStatus, pricing } = req.body;

    // Add to people.json
    const newPerson = {
        id: people.People.length + 1,
        Name: name,
        Roles: role,
        Email: email
    };
    people.People.push(newPerson);

    // Add to spaces.json
    const newSpace = {
        id: spaces.Spaces.length + 1,
        "Space Type": spaceType,
        Capacity: parseInt(capacity),
        Booking: {
            Status: bookingStatus,
            "Pricing (per month)": pricing
        }
    };
    spaces.Spaces.push(newSpace);

    // Save changes to JSON files
    fs.writeFileSync(peopleFilePath, JSON.stringify(people, null, 2));
    fs.writeFileSync(spacesFilePath, JSON.stringify(spaces, null, 2));

    res.status(201).json({ message: 'New information added successfully!' });
});


// Route to register new coworking data from people.json and spaces.json
app.post('/coworking', (req, res) => {
    const { personId, spaceId } = req.body;

    const person = people.People.find(p => p.id === personId);
    const space = spaces.Spaces.find(s => s.id === spaceId);

    if (!person || !space) {
        return res.status(404).json({ message: 'Person or Space not found' });
    }

    const registration = {
        personName: person.Name,
        personRole: person.Roles,
        spaceType: space["Space Type"],
        pricing: space.Booking["Pricing (per month)"],
        bookingStatus: space.Booking.Status  
    };

    let coworking = { Registrations: [] };
    if (fs.existsSync(coworkingFilePath)) {
        coworking = JSON.parse(fs.readFileSync(coworkingFilePath, 'utf8'));
    }

    coworking.Registrations.push(registration);
    fs.writeFileSync(coworkingFilePath, JSON.stringify(coworking, null, 2));

    res.status(201).json({ message: 'Registration successful', registration });
});
// Invoke-WebRequest -Uri http://localhost:3000/coworking -Method POST -ContentType "application/json" -Body '{"personId": 1, "spaceId": 1}'


// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}/1.1FirstPage.html`);
});