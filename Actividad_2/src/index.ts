import { DtoCrearActividad } from './dto/crear-actividad.dto';
import { IActividad } from './domain/actividad';
import { CRUDActividad } from './service/actividad';
import { CRUDUsuario } from './service/usuario';
import { CRUDCurso } from './service/curso';
import { DtoCrearUsuario } from "./dto/crear-usuario.dto";
import { IUsuario } from "./domain/usuarios";
import { DtoCrearCurso } from "./dto/crear-curso.dto";
import { ICurso } from "./domain/curso";

//Actividad
const crudactividad: CRUDActividad = new CRUDActividad(new CRUDUsuario(), new CRUDCurso());

const DtocrearActividad: DtoCrearActividad = {
    titulo: "Actividad 1",
    descripcion: "Descripción de la actividad 1",
    cursoId: 1,
    profesorId: 1
};

const actualizarActividad: IActividad = { 
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
const crudCurso: CRUDCurso = new CRUDCurso();

const dtoCrearCurso: DtoCrearCurso = {
    titulo: "Curso de Inglés Básico",
    descripcion: "Aprende inglés desde cero",
    profesorId: 1
};

const actualizarCurso: ICurso = { 
    id: 1,
    titulo: "Curso de Inglés Intermedio",
    descripcion: "Nivel intermedio",
    profesor: { id: '1', nombre: "Jose", email: "josemanuel@gmail.com", rol: "profesor" },
    actividades: [],
    estudiantesInscritos: []
};

function manejar_error(error: string) {
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

crudUsuario.createUsuario(dtoCrearUsuario);
crudUsuario.updateUsuario("prof-1", actrualizarUsuario);
console.log(crudUsuario.consulta("prof-1"));
crudUsuario.deleteUsuario("prof-1", manejar_error);







