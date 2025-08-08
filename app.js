const express = require('express');
const router = require('./router/router');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Middleware para parsing URL encoded
app.use(express.urlencoded({ extended: true }));

// Usar as rotas
app.use('/api', router);

// Rota de teste básica
app.get('/', (req, res) => {
    res.json({
        message: 'API Fernando está funcionando!',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            products: '/api/products'
        }
    });
});

// Middleware para tratar rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe`
    });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Algo deu errado!'
    });
});

app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
    console.log(` API disponível em: http://localhost:${PORT}`);
    console.log(`Documentação: http://localhost:${PORT}/api`);
});

module.exports = app;