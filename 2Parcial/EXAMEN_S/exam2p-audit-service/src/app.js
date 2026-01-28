/**
 * ============================================
 * APP.JS - Punto de entrada del microservicio
 * ============================================
 * exam2p-audit-service
 * 
 * Funcionalidades:
 * 1. Consume eventos de RabbitMQ (exam2p.record.deleted)
 * 2. Guarda auditoría en SQLite (Exam2PAuditLog)
 * 3. Emite webhook a n8n cuando action === DELETE
 * 4. Expone API REST en GET /exam2p-audit
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db/database');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'exam2p-audit-service',
        timestamp: new Date().toISOString()
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        service: 'exam2p-audit-service',
        version: '1.0.0',
        endpoints: {
            'GET /exam2p-audit': 'Obtener registros de auditoría (param: limit)',
            'GET /exam2p-audit/:id': 'Obtener registro por ID',
            'POST /exam2p-audit/test': 'Crear registro de prueba',
            'GET /health': 'Estado del servicio'
        }
    });
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

// Iniciar servidor después de inicializar la base de datos
async function startServer() {
    try {
        // Inicializar base de datos SQLite
        console.log('\n🔧 Inicializando base de datos SQLite...');
        await initializeDatabase();

        // Cargar rutas después de inicializar DB
        const auditRoutes = require('./routes/audit.routes');
        app.use('/', auditRoutes);

        // Iniciar servidor Express
        app.listen(PORT, async () => {
            console.log('\n============================================');
            console.log('🚀 exam2p-audit-service iniciado');
            console.log('============================================');
            console.log(`📍 Puerto: ${PORT}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`📋 Endpoint: GET /exam2p-audit`);
            console.log('============================================\n');

            // Conectar a RabbitMQ
            try {
                const { connectAndConsume } = require('./rabbit/consumer');
                await connectAndConsume();
            } catch (error) {
                console.error('⚠️ RabbitMQ no disponible, continuando sin consumidor...');
                console.error('   Mensaje:', error.message);
            }
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servicio...');
    try {
        const { closeConnection } = require('./rabbit/consumer');
        await closeConnection();
    } catch (e) {}
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando servicio...');
    try {
        const { closeConnection } = require('./rabbit/consumer');
        await closeConnection();
    } catch (e) {}
    process.exit(0);
});

// Iniciar
startServer();

module.exports = app;
