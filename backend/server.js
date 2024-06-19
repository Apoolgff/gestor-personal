const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const CLIENTS_FILE = path.join(__dirname, 'clients.json');

// Leer clientes desde el archivo JSON
app.get('/api/clients', (req, res) => {
    fs.readFile(CLIENTS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de clientes' });
        }
        res.json(JSON.parse(data || '[]'));
    });
});

// Agregar un nuevo cliente al archivo JSON
app.post('/api/clients', (req, res) => {
    const newClient = req.body;

    fs.readFile(CLIENTS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer el archivo de clientes' });
        }
        const clients = JSON.parse(data || '[]');
        clients.push(newClient);
        fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al guardar el cliente' });
            }
            res.status(201).json(newClient);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
