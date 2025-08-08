const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, '../data/sample.data.json');

// Função para ler dados do arquivo
const readData = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler dados:', error);
        return { users: [], products: [], orders: [] };
    }
};

// Função para escrever dados no arquivo
const writeData = (data) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao escrever dados:', error);
        return false;
    }
};

// Função para gerar próximo ID
const getNextId = (items) => {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// ========== ROTA PRINCIPAL DA API ==========
router.get('/', (req, res) => {
    res.json({
        message: 'API Fernando - Endpoints disponíveis',
        version: '1.0.0',
        endpoints: {
            users: {
                'GET /api/users': 'Listar todos os usuários',
                'GET /api/users/:id': 'Buscar usuário por ID',
                'POST /api/users': 'Criar novo usuário',
                'PUT /api/users/:id': 'Atualizar usuário',
                'DELETE /api/users/:id': 'Deletar usuário'
            },
            products: {
                'GET /api/products': 'Listar todos os produtos',
                'GET /api/products/:id': 'Buscar produto por ID',
                'POST /api/products': 'Criar novo produto',
                'PUT /api/products/:id': 'Atualizar produto',
                'DELETE /api/products/:id': 'Deletar produto'
            },
            orders: {
                'GET /api/orders': 'Listar todos os pedidos',
                'GET /api/orders/:id': 'Buscar pedido por ID',
                'POST /api/orders': 'Criar novo pedido',
                'PUT /api/orders/:id': 'Atualizar pedido',
                'DELETE /api/orders/:id': 'Deletar pedido'
            }
        }
    });
});

// ========== ROTAS DE USUÁRIOS ==========

// GET /api/users - Listar todos os usuários
router.get('/users', (req, res) => {
    try {
        const data = readData();
        const { page = 1, limit = 10, search } = req.query;
        
        let users = data.users;
        
        // Filtro de busca
        if (search) {
            users = users.filter(user => 
                user.name.toLowerCase().includes(search.toLowerCase()) ||
                user.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedUsers = users.slice(startIndex, endIndex);
        
        res.json({
            users: paginatedUsers,
            pagination: {
                total: users.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(users.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários', message: error.message });
    }
});

// GET /api/users/:id - Buscar usuário por ID
router.get('/users/:id', (req, res) => {
    try {
        const data = readData();
        const user = data.users.find(u => u.id === parseInt(req.params.id));
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário', message: error.message });
    }
});

// POST /api/users - Criar novo usuário
router.post('/users', (req, res) => {
    try {
        const { name, email, age, city } = req.body;
        
        // Validações básicas
        if (!name || !email) {
            return res.status(400).json({ error: 'Nome e email são obrigatórios' });
        }
        
        const data = readData();
        
        // Verificar se email já existe
        const emailExists = data.users.find(u => u.email === email);
        if (emailExists) {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        
        const newUser = {
            id: getNextId(data.users),
            name,
            email,
            age: age || null,
            city: city || null,
            created_at: new Date().toISOString()
        };
        
        data.users.push(newUser);
        
        if (writeData(data)) {
            res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
        } else {
            res.status(500).json({ error: 'Erro ao salvar usuário' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar usuário', message: error.message });
    }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { name, email, age, city } = req.body;
        
        const data = readData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Verificar se novo email já existe em outro usuário
        if (email) {
            const emailExists = data.users.find(u => u.email === email && u.id !== userId);
            if (emailExists) {
                return res.status(409).json({ error: 'Email já está em uso por outro usuário' });
            }
        }
        
        // Atualizar apenas os campos enviados
        if (name) data.users[userIndex].name = name;
        if (email) data.users[userIndex].email = email;
        if (age !== undefined) data.users[userIndex].age = age;
        if (city !== undefined) data.users[userIndex].city = city;
        
        if (writeData(data)) {
            res.json({ message: 'Usuário atualizado com sucesso', user: data.users[userIndex] });
        } else {
            res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário', message: error.message });
    }
});

// DELETE /api/users/:id - Deletar usuário
router.delete('/users/:id', (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const data = readData();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        const deletedUser = data.users.splice(userIndex, 1)[0];
        
        if (writeData(data)) {
            res.json({ message: 'Usuário deletado com sucesso', user: deletedUser });
        } else {
            res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário', message: error.message });
    }
});

// ========== ROTAS DE PRODUTOS ==========

// GET /api/products - Listar todos os produtos
router.get('/products', (req, res) => {
    try {
        const data = readData();
        const { page = 1, limit = 10, category, search } = req.query;
        
        let products = data.products;
        
        // Filtro por categoria
        if (category) {
            products = products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        // Filtro de busca
        if (search) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.description.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        res.json({
            products: paginatedProducts,
            pagination: {
                total: products.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(products.length / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos', message: error.message });
    }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/products/:id', (req, res) => {
    try {
        const data = readData();
        const product = data.products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto', message: error.message });
    }
});

// POST /api/products - Criar novo produto
router.post('/products', (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        
        // Validações básicas
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
        }
        
        if (price <= 0) {
            return res.status(400).json({ error: 'Preço deve ser maior que zero' });
        }
        
        const data = readData();
        
        const newProduct = {
            id: getNextId(data.products),
            name,
            description: description || '',
            price: parseFloat(price),
            category,
            stock: parseInt(stock) || 0,
            created_at: new Date().toISOString()
        };
        
        data.products.push(newProduct);
        
        if (writeData(data)) {
            res.status(201).json({ message: 'Produto criado com sucesso', product: newProduct });
        } else {
            res.status(500).json({ error: 'Erro ao salvar produto' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto', message: error.message });
    }
});

// PUT /api/products/:id - Atualizar produto
router.put('/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, description, price, category, stock } = req.body;
        
        const data = readData();
        const productIndex = data.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        // Validar preço se fornecido
        if (price !== undefined && price <= 0) {
            return res.status(400).json({ error: 'Preço deve ser maior que zero' });
        }
        
        // Atualizar apenas os campos enviados
        if (name) data.products[productIndex].name = name;
        if (description !== undefined) data.products[productIndex].description = description;
        if (price !== undefined) data.products[productIndex].price = parseFloat(price);
        if (category) data.products[productIndex].category = category;
        if (stock !== undefined) data.products[productIndex].stock = parseInt(stock);
        
        if (writeData(data)) {
            res.json({ message: 'Produto atualizado com sucesso', product: data.products[productIndex] });
        } else {
            res.status(500).json({ error: 'Erro ao atualizar produto' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto', message: error.message });
    }
});

// DELETE /api/products/:id - Deletar produto
router.delete('/products/:id', (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const data = readData();
        const productIndex = data.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        const deletedProduct = data.products.splice(productIndex, 1)[0];
        
        if (writeData(data)) {
            res.json({ message: 'Produto deletado com sucesso', product: deletedProduct });
        } else {
            res.status(500).json({ error: 'Erro ao deletar produto' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar produto', message: error.message });
    }
});

// ========== ROTAS DE PEDIDOS ==========

// GET /api/orders - Listar todos os pedidos
router.get('/orders', (req, res) => {
    try {
        const data = readData();
        const { status, user_id } = req.query;
        
        let orders = data.orders;
        
        // Filtro por status
        if (status) {
            orders = orders.filter(order => order.status === status);
        }
        
        // Filtro por usuário
        if (user_id) {
            orders = orders.filter(order => order.user_id === parseInt(user_id));
        }
        
        // Enriquecer com dados do usuário
        orders = orders.map(order => {
            const user = data.users.find(u => u.id === order.user_id);
            return {
                ...order,
                user: user ? { name: user.name, email: user.email } : null
            };
        });
        
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos', message: error.message });
    }
});

// GET /api/orders/:id - Buscar pedido por ID
router.get('/orders/:id', (req, res) => {
    try {
        const data = readData();
        const order = data.orders.find(o => o.id === parseInt(req.params.id));
        
        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        // Enriquecer com dados do usuário e produtos
        const user = data.users.find(u => u.id === order.user_id);
        const enrichedProducts = order.products.map(item => {
            const product = data.products.find(p => p.id === item.product_id);
            return {
                ...item,
                product: product ? {
                    name: product.name,
                    price: product.price,
                    category: product.category
                } : null
            };
        });
        
        res.json({
            ...order,
            user: user ? { name: user.name, email: user.email } : null,
            products: enrichedProducts
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedido', message: error.message });
    }
});

// POST /api/orders - Criar novo pedido
router.post('/orders', (req, res) => {
    try {
        const { user_id, products } = req.body;
        
        // Validações básicas
        if (!user_id || !products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: 'user_id e products são obrigatórios' });
        }
        
        const data = readData();
        
        // Verificar se usuário existe
        const user = data.users.find(u => u.id === parseInt(user_id));
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        // Calcular total e validar produtos
        let total = 0;
        const validatedProducts = [];
        
        for (const item of products) {
            const product = data.products.find(p => p.id === item.product_id);
            if (!product) {
                return res.status(404).json({ error: `Produto com ID ${item.product_id} não encontrado` });
            }
            
            if (item.quantity <= 0) {
                return res.status(400).json({ error: 'Quantidade deve ser maior que zero' });
            }
            
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Estoque insuficiente para o produto ${product.name}` });
            }
            
            total += product.price * item.quantity;
            validatedProducts.push({
                product_id: item.product_id,
                quantity: item.quantity
            });
        }
        
        const newOrder = {
            id: getNextId(data.orders),
            user_id: parseInt(user_id),
            products: validatedProducts,
            total: parseFloat(total.toFixed(2)),
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // Atualizar estoque dos produtos
        for (const item of validatedProducts) {
            const productIndex = data.products.findIndex(p => p.id === item.product_id);
            data.products[productIndex].stock -= item.quantity;
        }
        
        data.orders.push(newOrder);
        
        if (writeData(data)) {
            res.status(201).json({ message: 'Pedido criado com sucesso', order: newOrder });
        } else {
            res.status(500).json({ error: 'Erro ao salvar pedido' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar pedido', message: error.message });
    }
});

// PUT /api/orders/:id - Atualizar status do pedido
router.put('/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Status inválido', 
                validStatuses 
            });
        }
        
        const data = readData();
        const orderIndex = data.orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        data.orders[orderIndex].status = status;
        
        if (writeData(data)) {
            res.json({ 
                message: 'Status do pedido atualizado com sucesso', 
                order: data.orders[orderIndex] 
            });
        } else {
            res.status(500).json({ error: 'Erro ao atualizar pedido' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar pedido', message: error.message });
    }
});

// DELETE /api/orders/:id - Cancelar pedido
router.delete('/orders/:id', (req, res) => {
    try {
        const orderId = parseInt(req.params.id);
        const data = readData();
        const orderIndex = data.orders.findIndex(o => o.id === orderId);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        
        const order = data.orders[orderIndex];
        
        // Se o pedido ainda está pendente, devolver itens ao estoque
        if (order.status === 'pending') {
            for (const item of order.products) {
                const productIndex = data.products.findIndex(p => p.id === item.product_id);
                if (productIndex !== -1) {
                    data.products[productIndex].stock += item.quantity;
                }
            }
        }
        
        const deletedOrder = data.orders.splice(orderIndex, 1)[0];
        
        if (writeData(data)) {
            res.json({ message: 'Pedido cancelado com sucesso', order: deletedOrder });
        } else {
            res.status(500).json({ error: 'Erro ao cancelar pedido' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cancelar pedido', message: error.message });
    }
});

module.exports = router;