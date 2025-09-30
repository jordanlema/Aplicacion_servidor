"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUDUsuario = void 0;
const usuarios = [
    { id: 'prof-1', nombre: 'Profesor Base', email: 'profesor@school.edu', rol: 'profesor' },
    { id: 'stu-101', nombre: 'Estudiante Base', email: 'estudiante@student.edu', rol: 'estudiante' },
];
class CRUDUsuario {
    constructor() {
        console.log("CRUDUsuario iniciado");
    }
    createUsuario(nuevoUsuario) {
        if (usuarios.some(u => u.email === nuevoUsuario.email)) {
            throw new Error(`[CRUDUsuario] El email ${nuevoUsuario.email} ya está en uso.`);
        }
        const usuario = {
            id: nuevoUsuario.rol === 'PROFESOR' ? `prof-${Date.now()}` : `stu-${Date.now()}`,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol.toLowerCase(),
        };
        usuarios.push(usuario);
        return usuario;
    }
    readUsuarios() {
        return usuarios;
    }
    consulta(id) {
        const usuario = usuarios.find(u => u.id === id);
        return usuario;
    }
    updateUsuario(id, datosActualizados) {
        const idx = usuarios.findIndex(u => u.id === id);
        if (idx === -1)
            throw new Error("[CRUDUsuario] Usuario no encontrado para actualizar.");
        usuarios[idx] = datosActualizados;
        return usuarios[idx];
    }
    deleteUsuario(id, callback_error) {
        const idx = usuarios.findIndex(u => u.id === id);
        if (idx === -1)
            throw new Error("[CRUDUsuario] Usuario no encontrado para eliminar.");
        usuarios.splice(idx, 1);
        console.log(`[CRUDUsuario] Usuario con ID ${id} eliminado.`);
    }
}
exports.CRUDUsuario = CRUDUsuario;
//# sourceMappingURL=usuario.js.map