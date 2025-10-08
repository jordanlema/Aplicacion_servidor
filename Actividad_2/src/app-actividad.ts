import { DtoCrearActividad } from './dto/crear-actividad.dto';
import { IActividad } from './domain/actividad';
import { CRUDActividad } from './service/actividad';
import { CRUDUsuario } from './service/usuario';
import { CRUDCurso } from './service/curso';

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

function manejar_error(error: string) {
    if (error) {
        console.log(error);
        return;
    }
}

crudactividad.createActividad(DtocrearActividad);
crudactividad.updateActividad(1, actualizarActividad);
console.log(crudactividad.consulta(1));
crudactividad.deleteActividad(1, manejar_error);




