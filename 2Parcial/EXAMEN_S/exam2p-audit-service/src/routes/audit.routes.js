/**
 * ============================================
 * AUDIT.ROUTES.JS - Rutas REST de Auditoría
 * ============================================
 * Endpoint: GET /exam2p-audit
 * Query param opcional: limit
 */

const express = require('express');
const router = express.Router();
const Exam2PAuditLog = require('../models/Exam2PAuditLog');

/**
 * GET /exam2p-audit
 * Obtiene los registros de auditoría
 * 
 * Query params:
 * - limit (opcional): Número máximo de registros a retornar
 * 
 * Ejemplo: GET /exam2p-audit?limit=10
 */
router.get('/exam2p-audit', (req, res) => {
    try {
        const { limit } = req.query;

        console.log(`📋 GET /exam2p-audit - limit: ${limit || 'sin límite'}`);

        // Obtener registros con límite opcional
        const records = Exam2PAuditLog.findAll(limit);

        console.log(`✅ Retornando ${records.length} registros`);

        res.json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error('❌ Error al obtener registros:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /exam2p-audit/:id
 * Obtiene un registro de auditoría por ID
 */
router.get('/exam2p-audit/:id', (req, res) => {
    try {
        const { id } = req.params;
        const record = Exam2PAuditLog.findById(parseInt(id));

        if (!record) {
            return res.status(404).json({
                success: false,
                error: 'Registro no encontrado'
            });
        }

        res.json({
            success: true,
            data: record
        });

    } catch (error) {
        console.error('❌ Error al obtener registro:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /exam2p-audit/action/:action
 * Obtiene registros por tipo de acción
 */
router.get('/exam2p-audit/action/:action', (req, res) => {
    try {
        const { action } = req.params;
        const validActions = ['CREATE', 'UPDATE', 'DELETE'];

        if (!validActions.includes(action.toUpperCase())) {
            return res.status(400).json({
                success: false,
                error: 'Acción inválida. Use: CREATE, UPDATE o DELETE'
            });
        }

        const records = Exam2PAuditLog.findByAction(action.toUpperCase());

        res.json({
            success: true,
            count: records.length,
            data: records
        });

    } catch (error) {
        console.error('❌ Error al obtener registros:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /exam2p-audit/test
 * Endpoint de prueba para crear registros manualmente
 * Útil para testing sin RabbitMQ
 */
router.post('/exam2p-audit/test', async (req, res) => {
    try {
        const {
            exam2p_entity,
            exam2p_recordId,
            exam2p_action,
            exam2p_user,
            exam2p_detail
        } = req.body;

        // Validar campos requeridos
        if (!exam2p_entity || !exam2p_action) {
            return res.status(400).json({
                success: false,
                error: 'Campos requeridos: exam2p_entity, exam2p_action'
            });
        }

        // Crear registro
        const record = Exam2PAuditLog.create({
            exam2p_entity,
            exam2p_recordId: exam2p_recordId || 0,
            exam2p_action,
            exam2p_user: exam2p_user || 'test-user',
            exam2p_timestamp: new Date().toISOString(),
            exam2p_detail: exam2p_detail || ''
        });

        // Si es DELETE, emitir webhook
        if (exam2p_action === 'DELETE') {
            const { emitDeletionWebhook } = require('../webhook/webhookEmitter');
            await emitDeletionWebhook(record);
        }

        res.status(201).json({
            success: true,
            message: 'Registro creado exitosamente',
            data: record
        });

    } catch (error) {
        console.error('❌ Error al crear registro:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
