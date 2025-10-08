"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUDActividad = void 0;
const actividades = [];
let nextActividadId = 1;
class CRUDActividad {
    usuarioService;
    cursoService;
    constructor(usuarioService, cursoService) {
        console.log("CRUDActividad iniciado");
        this.usuarioService = usuarioService;
        this.cursoService = cursoService;
    }
    createActividad(nuevaActividad) {
        const actividad = {
            id: nextActividadId++,
            titulo: nuevaActividad.titulo,
            descripcion: nuevaActividad.descripcion,
            cursoId: nuevaActividad.cursoId,
            profesor: { id: nuevaActividad.profesorId },
        };
        actividades.push(actividad);
        console.log(`Actividad '${actividad.titulo}' creada con ID: ${actividad.id}`);
    }
    readActividades() {
        return actividades;
    }
    updateActividad(id, nuevaActividad) {
        const idx = actividades.findIndex(actividad => actividad.id === id);
        if (idx === -1)
            return console.log("Not Found");
        actividades[idx] = nuevaActividad;
    }
    deleteActividad(id, callback_error) {
        const idx = actividades.findIndex(actividad => actividad.id === id);
        if (idx === -1) {
            callback_error("Not Found");
            return;
        }
        actividades.splice(idx, 1);
        console.log(`Actividad con ID ${id} eliminada.`);
    }
    consulta(id) {
        const actividad = actividades.find(actividad => actividad.id === id);
        if (!actividad)
            throw new Error("Not Found");
        return actividad;
    }
}
exports.CRUDActividad = CRUDActividad;
//# sourceMappingURL=actividad.js.map