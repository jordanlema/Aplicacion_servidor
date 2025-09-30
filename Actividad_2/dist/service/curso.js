"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRUDCurso = void 0;
const cursos = [];
class CRUDCurso {
    constructor() {
        console.log("CRUDCurso iniciado");
    }
    createCurso(nuevoCurso) {
        const curso = {
            id: cursos.length + 1,
            titulo: nuevoCurso.titulo,
            descripcion: nuevoCurso.descripcion,
            profesor: { id: nuevoCurso.profesorId },
            actividades: [],
            estudiantesInscritos: []
        };
        cursos.push(curso);
    }
    readCursos() {
        return cursos;
    }
    updateCurso(id, nuevoCurso) {
        const idx = cursos.findIndex(curso => curso.id === id);
        if (idx === -1)
            return console.log("Not Found");
        cursos[idx] = nuevoCurso;
    }
    deleteCurso(id, callback_error) {
        const idx = cursos.findIndex(curso => curso.id === id);
        if (idx === -1) {
            callback_error("Not Found");
            return;
        }
        cursos.splice(idx, 1);
    }
    consulta(id) {
        const curso = cursos.find(curso => curso.id === id);
        if (!curso)
            throw new Error("Not Found");
        return curso;
    }
}
exports.CRUDCurso = CRUDCurso;
//# sourceMappingURL=curso.js.map