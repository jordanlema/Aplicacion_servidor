import { CRUDUsuario } from "./service/usuario";
import { DtoCrearUsuario } from "./dto/crear-usuario.dto";
import { IUsuario } from "./domain/usuarios";

const crudUsuario: CRUDUsuario = new CRUDUsuario();

const dtoCrearUsuario: DtoCrearUsuario = {
    nombre: "Nuevo Usuario",
    email: "josemanuel@gmail.com",
    password: "password123",
    rol: "PROFESOR"
};

const actrualizarUsuario: IUsuario = {
    id: "prof-1",
    nombre: "Usuario Actualizado",
    email: "josemanuel@gmail.com",
    rol: "profesor"
};

function manejar_error(error: string) {
    if (error) {
        console.log(error);
        return;
    }
};

crudUsuario.createUsuario(dtoCrearUsuario);
crudUsuario.updateUsuario("prof-1", actrualizarUsuario);
console.log(crudUsuario.consulta("prof-1"));
crudUsuario.deleteUsuario("prof-1", manejar_error);