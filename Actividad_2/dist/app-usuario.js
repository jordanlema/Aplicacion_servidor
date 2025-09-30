"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usuario_1 = require("./service/usuario");
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
function manejar_error(error) {
    if (error) {
        console.log(error);
        return;
    }
}
;
crudUsuario.createUsuario(dtoCrearUsuario);
crudUsuario.updateUsuario("prof-1", actrualizarUsuario);
console.log(crudUsuario.consulta("prof-1"));
crudUsuario.deleteUsuario("prof-1", manejar_error);
//# sourceMappingURL=app-usuario.js.map