"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actividad_1 = require("./service/actividad");
const usuario_1 = require("./service/usuario");
const curso_1 = require("./service/curso");
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
    profesor: { id: '1', nombre: "Juan", email: "jordanle@email.com", rol: "profesor" }
};
function manejar_error(error) {
    if (error) {
        console.log(error);
        return;
    }
}
crudactividad.createActividad(DtocrearActividad);
crudactividad.updateActividad(1, actualizarActividad);
console.log(crudactividad.consulta(1));
crudactividad.deleteActividad(1, manejar_error);
//# sourceMappingURL=app-actividad.js.map