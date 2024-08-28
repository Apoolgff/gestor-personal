const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises; // Usar fs.promises para promisificar fs
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const CLIENTS_FILE = path.join(__dirname, 'clients.json');
const BUDGETS_FILE = path.join(__dirname, 'budgets.json');

// Leer clientes desde el archivo JSON
app.get('/api/clients', async (req, res) => {
    try {
        const data = await fs.readFile(CLIENTS_FILE, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (error) {
        res.status(500).json({ error: 'Error al leer el archivo de clientes' });
    }
});

// Agregar un nuevo cliente al archivo JSON
app.post('/api/clients', async (req, res) => {
    const newClient = req.body;
    try {
        let data = await fs.readFile(CLIENTS_FILE, 'utf8');
        const clients = JSON.parse(data || '[]');
        clients.push(newClient);
        await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el cliente' });
    }
});

// Eliminar un cliente del archivo JSON  
app.delete('/api/clients/:email', async (req, res) => {
    const { email } = req.params;
    try {
        let data = await fs.readFile(CLIENTS_FILE, 'utf8');
        let clients = JSON.parse(data || '[]');
        clients = clients.filter(client => client.email !== email);
        await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el archivo de clientes' });
    }
});

// Modificar un cliente en el archivo JSON
app.put('/api/clients/:email', async (req, res) => {
    const { email } = req.params;
    const updatedClient = req.body;
    try {
        let data = await fs.readFile(CLIENTS_FILE, 'utf8');
        let clients = JSON.parse(data || '[]');
        clients = clients.map(client => (client.email === email ? updatedClient : client));
        await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2));
        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el archivo de clientes' });
    }
});

// Leer presupuestos desde el archivo JSON
app.get('/api/budgets', async (req, res) => {
    try {
        const data = await fs.readFile(BUDGETS_FILE, 'utf8');
        res.json(JSON.parse(data || '[]'));
    } catch (error) {
        console.error('Error al leer el archivo de presupuestos', error);
        res.status(500).json({ error: 'Error al leer el archivo de presupuestos' });
    }
});

// Agregar un nuevo presupuesto al archivo JSON
app.post('/api/budgets', async (req, res) => {
    const newBudget = {
        ...req.body,
        id: uuidv4(),
    };
    try {
        let budgetsData = await fs.readFile(BUDGETS_FILE, 'utf8');
        const budgets = JSON.parse(budgetsData || '[]');
        budgets.push(newBudget);
        await fs.writeFile(BUDGETS_FILE, JSON.stringify(budgets, null, 2));

        // Actualizar cliente con el nuevo presupuesto
        let clientsData = await fs.readFile(CLIENTS_FILE, 'utf8');
        let clients = JSON.parse(clientsData || '[]');
        const clientIndex = clients.findIndex(client => client.email === newBudget.clientEmail);
        if (clientIndex !== -1) {
            // Verifica si el cliente tiene una propiedad `budgets` definida
            if (!clients[clientIndex].budgets) {
                clients[clientIndex].budgets = [];
            }
            clients[clientIndex].budgets.push(newBudget.id);
            await fs.writeFile(CLIENTS_FILE, JSON.stringify(clients, null, 2));
            res.status(201).json(newBudget);
        } else {
            res.status(404).json({ error: 'Cliente no encontrado' });
        }
    } catch (error) {
        console.error('Error al guardar el presupuesto', error);
        res.status(500).json({ error: 'Error al guardar el presupuesto' });
    }
});

// Ruta para obtener los detalles del presupuesto por ID
app.get('/api/budgets/:budgetId', async (req, res) => {
    const { budgetId } = req.params;

    try {
        // Leer el contenido de budget.json
        const data = await fs.readFile(BUDGETS_FILE, 'utf8');
        const budgets = JSON.parse(data);

        // Buscar el presupuesto por ID
        const budget = budgets.find(b => b.id === budgetId);

        // Verificar si el presupuesto existe
        if (budget) {
            res.json(budget);
        } else {
            res.status(404).json({ error: 'Presupuesto no encontrado' });
        }
    } catch (error) {
        console.error('Error al leer el archivo budget.json', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
