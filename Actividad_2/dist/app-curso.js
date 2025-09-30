"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const curso_1 = require("./service/curso");
const crudCurso = new curso_1.CRUDCurso();
const dtoCrearCurso = {
    titulo: "Curso de Inglés Básico",
    descripcion: "Aprende inglés desde cero",
    profesorId: 1
};
const actualizarCurso = {
    id: 1,
    titulo: "Curso de Inglés Intermedio",
    descripcion: "Nivel intermedio",
    profesor: { id: '1', nombre: "Jose", email: "josemanuel@gmail.com", rol: "profesor" },
    actividades: [],
    estudiantesInscritos: []
};
function manejar_error(error) {
    if (error) {
        console.log(error);
        return;
    }
}
crudCurso.createCurso(dtoCrearCurso);
crudCurso.updateCurso(1, actualizarCurso);
console.log(crudCurso.consulta(1));
crudCurso.deleteCurso(1, manejar_error);
//# sourceMappingURL=app-curso.js.map