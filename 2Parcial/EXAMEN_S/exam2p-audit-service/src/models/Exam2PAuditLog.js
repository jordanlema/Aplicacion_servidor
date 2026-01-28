const { runInsert, runSelect, saveDatabase } = require('../db/database');

/**
 * Clase Exam2PAuditLog
 * Representa un registro de auditoría en el sistema
 */
class Exam2PAuditLog {
    /**
     * Crear un nuevo registro de auditoría
     * @param {Object} auditData 
     * @param {string} auditData.exam2p_entity 
     * @param {number} auditData.exam2p_recordId 
     * @param {string} auditData.exam2p_action 
     * @param {string} auditData.exam2p_user 
     * @param {string} auditData.exam2p_timestamp 
     * @param {string} auditData.exam2p_detail 
     * @returns {Object} 
     */
    static create(auditData) {
        const {
            exam2p_entity,
            exam2p_recordId,
            exam2p_action,
            exam2p_user,
            exam2p_timestamp,
            exam2p_detail
        } = auditData;

        const sql = `
            INSERT INTO Exam2PAuditLog 
            (exam2p_entity, exam2p_recordId, exam2p_action, exam2p_user, exam2p_timestamp, exam2p_detail)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const id = runInsert(sql, [
            exam2p_entity,
            exam2p_recordId || 0,
            exam2p_action,
            exam2p_user || 'system',
            exam2p_timestamp || new Date().toISOString(),
            exam2p_detail || ''
        ]);

        console.log(`✅ Registro de auditoría creado con ID: ${id}`);

        return {
            id,
            exam2p_entity,
            exam2p_recordId: exam2p_recordId || 0,
            exam2p_action,
            exam2p_user: exam2p_user || 'system',
            exam2p_timestamp: exam2p_timestamp || new Date().toISOString(),
            exam2p_detail: exam2p_detail || ''
        };
    }

    /**
     * Obtener todos los registros de auditoría
     * @param {number} limit - Límite de registros a retornar (opcional)
     * @returns {Array} Lista de registros de auditoría
     */
    static findAll(limit = null) {
        let sql = 'SELECT * FROM Exam2PAuditLog ORDER BY id DESC';
        
        if (limit && Number.isInteger(parseInt(limit))) {
            sql += ` LIMIT ${parseInt(limit)}`;
        }

        return runSelect(sql);
    }

    /**
     * Obtener un registro por ID
     * @param {number} id - ID del registro
     * @returns {Object|null} Registro encontrado o null
     */
    static findById(id) {
        const results = runSelect('SELECT * FROM Exam2PAuditLog WHERE id = ?', [id]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Obtener registros por acción
     * @param {string} action - Tipo de acción (CREATE|UPDATE|DELETE)
     * @returns {Array} Lista de registros
     */
    static findByAction(action) {
        return runSelect('SELECT * FROM Exam2PAuditLog WHERE exam2p_action = ? ORDER BY id DESC', [action]);
    }

    /**
     * Obtener registros por entidad
     * @param {string} entity - Nombre de la entidad
     * @returns {Array} Lista de registros
     */
    static findByEntity(entity) {
        return runSelect('SELECT * FROM Exam2PAuditLog WHERE exam2p_entity = ? ORDER BY id DESC', [entity]);
    }
}

module.exports = Exam2PAuditLog;
