/**
 * ============================================
 * WEBHOOKEMITTER.JS - Emisor de Webhooks
 * ============================================
 * Emite webhooks hacia n8n cuando se detecta una acción DELETE
 * Evento: exam2p.audit.deletion
 */

const axios = require('axios');

// URL del webhook de n8n (configurar en .env)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/exam2p-audit-deletion';

/**
 * Emitir webhook de eliminación hacia n8n
 * Solo se emite cuando exam2p_action === "DELETE"
 * 
 * @param {Object} auditData - Datos del registro de auditoría
 * @param {string} auditData.exam2p_entity - Entidad afectada
 * @param {number} auditData.exam2p_recordId - ID del registro eliminado
 * @param {string} auditData.exam2p_action - Acción realizada
 * @param {string} auditData.exam2p_user - Usuario que realizó la acción
 * @param {string} auditData.exam2p_detail - Detalle adicional
 */
async function emitDeletionWebhook(auditData) {
    // Solo emitir webhook si la acción es DELETE
    if (auditData.exam2p_action !== 'DELETE') {
        console.log('ℹ️ Acción no es DELETE, no se emite webhook');
        return null;
    }

    // Payload EXACTO según especificación del examen
    const webhookPayload = {
        event: "exam2p.audit.deletion",
        timestamp: new Date().toISOString(),
        data: {
            exam2p_entity: auditData.exam2p_entity,
            exam2p_recordId: auditData.exam2p_recordId,
            exam2p_user: auditData.exam2p_user,
            exam2p_detail: auditData.exam2p_detail || ''
        }
    };

    console.log('📤 Emitiendo webhook exam2p.audit.deletion...');
    console.log('📦 Payload:', JSON.stringify(webhookPayload, null, 2));

    try {
        const response = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
        });

        console.log('✅ Webhook emitido exitosamente');
        console.log('📥 Respuesta de n8n:', response.status, response.data);

        return {
            success: true,
            status: response.status,
            data: response.data
        };
    } catch (error) {
        console.error('❌ Error al emitir webhook:', error.message);
        
        // Si n8n no está disponible, loguear pero no fallar
        if (error.code === 'ECONNREFUSED') {
            console.warn('⚠️ n8n no está disponible en:', N8N_WEBHOOK_URL);
        }

        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = {
    emitDeletionWebhook
};
