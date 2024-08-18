const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(express.json());

// Servindo arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Caminhos dos arquivos JSON
const peopleFilePath = path.join(__dirname, 'data', 'people.json');
const spacesFilePath = path.join(__dirname, 'data', 'spaces.json');

// Carregar dados dos arquivos JSON
let people = JSON.parse(fs.readFileSync(peopleFilePath, 'utf8'));
let spaces = JSON.parse(fs.readFileSync(spacesFilePath, 'utf8'));

// Redirecionar para a página principal '1.1FirstPage.html'
app.get('/', (req, res) => {
    res.redirect('/1.1FirstPage.html');
});

// Rota para obter todos os espaços ou filtrar por preço máximo
app.get('/spaces', (req, res) => {
    const { maxPrice } = req.query;

    let results = spaces.Spaces;

    // Filtrar por preço máximo
    if (maxPrice) {
        results = results.filter(space => 
            parseFloat(space.Booking["Pricing (per month)"].replace('$', '')) <= parseFloat(maxPrice)
        );
    }

    res.json({ Spaces: results });
});

// Rota para obter um espaço por ID
app.get('/spaces/:id', (req, res) => {
    const spaceId = parseInt(req.params.id);
    const space = spaces.Spaces.find(s => s.id === spaceId);

    if (!space) {
        return res.status(404).json({ message: 'Space not found' });
    }

    res.json(space);
});

// Rota para obter todas as pessoas
app.get('/people', (req, res) => {
    res.json(people);
});

// Rota para obter uma pessoa por ID
app.get('/people/:id', (req, res) => {
    const personId = parseInt(req.params.id);
    const person = people.People.find(p => p.id === personId);

    if (!person) {
        return res.status(404).json({ message: 'Person not found' });
    }

    res.json(person);
});

// Rota para adicionar uma nova pessoa e um novo espaço
app.post('/add', (req, res) => {
    const { name, role, email, spaceType, capacity, bookingStatus, pricing } = req.body;

    // Adicionar ao people.json
    const newPerson = {
        id: people.People.length + 1,
        Name: name,
        Roles: role,
        Email: email
    };
    people.People.push(newPerson);

    // Adicionar ao spaces.json
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

    // Salvar alterações nos arquivos JSON
    fs.writeFileSync(peopleFilePath, JSON.stringify(people, null, 2));
    fs.writeFileSync(spacesFilePath, JSON.stringify(spaces, null, 2));

    res.status(201).json({ message: 'New information added successfully!' });
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}/1.1FirstPage.html`);
});