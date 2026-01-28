/**
 * ============================================
 * DATABASE.JS - Configuración de SQLite (sql.js)
 * ============================================
 * Inicializa la base de datos SQLite y crea la tabla Exam2PAuditLog
 * Usa sql.js que no requiere compilación nativa
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Ruta de la base de datos
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');

let db = null;

/**
 * Inicializa la base de datos SQLite
 * Crea la tabla Exam2PAuditLog con la estructura EXACTA requerida
 */
async function initializeDatabase() {
    const SQL = await initSqlJs();

    // Cargar base de datos existente o crear nueva
    try {
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
            console.log('📂 Base de datos cargada desde:', dbPath);
        } else {
            db = new SQL.Database();
            console.log('🆕 Nueva base de datos creada');
        }
    } catch (error) {
        db = new SQL.Database();
        console.log('🆕 Nueva base de datos creada (error al cargar):', error.message);
    }

    // Crear tabla si no existe
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS Exam2PAuditLog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam2p_entity TEXT NOT NULL,
            exam2p_recordId INTEGER NOT NULL,
            exam2p_action TEXT NOT NULL CHECK(exam2p_action IN ('CREATE', 'UPDATE', 'DELETE')),
            exam2p_user TEXT NOT NULL,
            exam2p_timestamp TEXT NOT NULL,
            exam2p_detail TEXT
        )
    `;

    db.run(createTableSQL);
    saveDatabase();
    console.log('✅ Tabla Exam2PAuditLog inicializada correctamente');

    return db;
}

/**
 * Guarda la base de datos en disco
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        
        // Crear directorio si no existe
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(dbPath, buffer);
    }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDatabase() {
    return db;
}

/**
 * Ejecuta una consulta INSERT y retorna el último ID insertado
 */
function runInsert(sql, params = []) {
    db.run(sql, params);
    const result = db.exec('SELECT last_insert_rowid() as id');
    saveDatabase();
    return result[0].values[0][0];
}

/**
 * Ejecuta una consulta SELECT y retorna los resultados
 */
function runSelect(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
        stmt.bind(params);
    }
    
    const results = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row);
    }
    stmt.free();
    return results;
}

module.exports = {
    initializeDatabase,
    getDatabase,
    saveDatabase,
    runInsert,
    runSelect
};
