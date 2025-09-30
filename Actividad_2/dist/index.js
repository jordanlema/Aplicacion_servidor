"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actividad_1 = require("./service/actividad");
const usuario_1 = require("./service/usuario");
const curso_1 = require("./service/curso");
//Actividad
const crudactividad = new actividad_1.CRUDActividad(new usuario_1.CRUDUsuario(), new curso_1.CRUDCurso());
const DtocrearActividad = {
    titulo: "Actividad 1",
    descripcion: "Descripción de la actividad 1",
    cursoId: 1,
    profesorId: 1
};
const actualizarActividad = {
    id: 1,
    titulo: "Actividad 1 Actualizada",
    descripcion: "Descripción actualizada",
    cursoId: 1,
    profesor: { id: '1', nombre: "Jose", email: "josemanuel@gmail.com", rol: "profesor" }
};
crudactividad.createActividad(DtocrearActividad);
crudactividad.updateActividad(1, actualizarActividad);
console.log(crudactividad.consulta(1));
crudactividad.deleteActividad(1, manejar_error);
//Curso
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
//Usuario
const crudUsuario = new usuario_1.CRUDUsuario();
const dtoCrearUsuario = {
    nombre: "Nuevo Usuario",
    email: "josemanuel@gmail.com",
    password: "password123",
    rol: "PROFESOR"
};
const actrualizarUsuario = {
    id: "prof-1",
    nombre: "Usuario Actualizado",
    email: "josemanuel@gmail.com",
    rol: "profesor"
};
crudUsuario.createUsuario(dtoCrearUsuario);
crudUsuario.updateUsuario("prof-1", actrualizarUsuario);
console.log(crudUsuario.consulta("prof-1"));
crudUsuario.deleteUsuario("prof-1", manejar_error);
//# sourceMappingURL=index.js.map