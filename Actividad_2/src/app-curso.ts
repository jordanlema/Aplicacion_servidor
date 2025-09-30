import { CRUDCurso } from "./service/curso";
import { DtoCrearCurso } from "./dto/crear-curso.dto";
import { ICurso } from "./domain/curso";

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
    profesor: { id: '1', nombre: "Juan", email: "profe@mail.com", rol: "profesor" },
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
