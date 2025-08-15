const express = require('express');
const bodyParser = require('body-parser');
const MpesaAPI = require('mpesa-api-nodejs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3111;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS middleware para permitir requisições do frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req,res,next)=>{
    if(req.body){
        console.log('Request Body:',req.body);
    }
    next();
});
// Variável global para armazenar a instância do Mpesa
let mpesaInstance = null;

// Rota para configurar a API Mpesa
app.post('/api/configure', (req, res) => {
    try {
        const { api_key, public_key, environment, ssl } = req.body;
        
        if (!api_key || !public_key) {
            return res.status(400).json({
                success: false,
                message: 'API Key e Public Key são obrigatórios'
            });
        }

        // Inicializar a instância do Mpesa
        mpesaInstance = MpesaAPI.init(
            api_key,
            public_key,
            environment || 'development',
            ssl !== undefined ? ssl : true
        );

        res.json({
            success: true,
            message: 'API Mpesa configurada com sucesso',
            config: {
                environment: environment || 'development',
                ssl: ssl !== undefined ? ssl : true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao configurar API Mpesa',
            error: error.message
        });
    }
});

// Rota para transferência B2C (Business to Client)
app.post('/api/b2c', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { value, client_number, agent_id, transaction_reference, third_party_reference } = req.body;

        if (!value || !client_number || !agent_id || !transaction_reference || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para B2C'
            });
        }

        const data = {
            value: parseFloat(value),
            client_number,
            agent_id: parseInt(agent_id),
            transaction_reference: parseInt(transaction_reference),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.b2c(data);
        
        res.json({
            success: true,
            message: 'Transação B2C processada',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na transação B2C',
            error: error.message
        });
    }
});

// Rota para transferência C2B (Client to Business)
app.post('/api/c2b', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { value, client_number, agent_id, transaction_reference, third_party_reference } = req.body;

        if (!value || !client_number || !agent_id || !transaction_reference || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para C2B'
            });
        }

        const data = {
            value: parseFloat(value),
            client_number,
            agent_id: parseInt(agent_id),
            transaction_reference: parseInt(transaction_reference),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.c2b(data);
        
        res.json({
            success: true,
            message: 'Transação C2B processada',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na transação C2B',
            error: error.message
        });
    }
});

// Rota para transferência B2B (Business to Business)
app.post('/api/b2b', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { value, agent_id, agent_receiver_id, transaction_reference, third_party_reference } = req.body;

        if (!value || !agent_id || !agent_receiver_id || !transaction_reference || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para B2B'
            });
        }

        const data = {
            value: parseFloat(value),
            agent_id: parseInt(agent_id),
            agent_receiver_id: parseInt(agent_receiver_id),
            transaction_reference: parseInt(transaction_reference),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.b2b(data);
        
        res.json({
            success: true,
            message: 'Transação B2B processada',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na transação B2B',
            error: error.message
        });
    }
});

// Rota para reversão de transação
app.post('/api/reversal', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { value, security_credential, indicator_identifier, transaction_id, agent_id, third_party_reference } = req.body;

        if (!value || !security_credential || !indicator_identifier || !transaction_id || !agent_id || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para reversão'
            });
        }

        const data = {
            value: parseFloat(value),
            security_credential,
            indicator_identifier,
            transaction_id,
            agent_id: parseInt(agent_id),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.reversal(data);
        
        res.json({
            success: true,
            message: 'Reversão processada',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na reversão',
            error: error.message
        });
    }
});

// Rota para consulta de status
app.post('/api/status', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { transaction_id, agent_id, third_party_reference } = req.body;

        if (!transaction_id || !agent_id || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para consulta de status'
            });
        }

        const data = {
            transaction_id,
            agent_id: parseInt(agent_id),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.status(data);
        
        res.json({
            success: true,
            message: 'Status consultado',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na consulta de status',
            error: error.message
        });
    }
});

// Rota para obter nome do cliente
app.post('/api/customer-name', async (req, res) => {
    try {
        if (!mpesaInstance) {
            return res.status(400).json({
                success: false,
                message: 'API Mpesa não configurada. Configure primeiro.'
            });
        }

        const { client_number, agent_id, third_party_reference } = req.body;

        if (!client_number || !agent_id || !third_party_reference) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios para obter nome do cliente'
            });
        }

        const data = {
            client_number,
            agent_id: parseInt(agent_id),
            third_party_reference: parseInt(third_party_reference)
        };

        const response = await mpesaInstance.customer_name(data);
        
        res.json({
            success: true,
            message: 'Nome do cliente consultado',
            data: response
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro na consulta do nome do cliente',
            error: error.message
        });
    }
});

// Rota principal para servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app;

