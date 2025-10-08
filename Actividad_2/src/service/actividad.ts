import type { IActividad } from "../domain/actividad";
import type { DtoCrearActividad } from "../dto/crear-actividad.dto";
import type { CRUDUsuario } from './usuario'; 
import type { CRUDCurso } from './curso';   

const actividades: IActividad[] = [];
let nextActividadId = 1;

export class CRUDActividad {
    private usuarioService: CRUDUsuario;
    private cursoService: CRUDCurso;

    constructor(usuarioService: CRUDUsuario, cursoService: CRUDCurso) {
        console.log("CRUDActividad iniciado");
        this.usuarioService = usuarioService;
        this.cursoService = cursoService;
    }

    createActividad(nuevaActividad: DtoCrearActividad): void {
        const actividad: IActividad = {
            id: nextActividadId++,
            titulo: nuevaActividad.titulo,
            descripcion: nuevaActividad.descripcion,
            cursoId: nuevaActividad.cursoId,
            profesor: { id: nuevaActividad.profesorId } as any, 
        };

        actividades.push(actividad);
        console.log(`Actividad '${actividad.titulo}' creada con ID: ${actividad.id}`);
    }

    readActividades(): IActividad[] {
        return actividades;
    }

    updateActividad(id: number, nuevaActividad: IActividad): void {
        const idx = actividades.findIndex(actividad => actividad.id === id);
        if (idx === -1) return console.log("Not Found");
        actividades[idx] = nuevaActividad;
    }

    deleteActividad(id: number, callback_error: CallableFunction): void {
        const idx = actividades.findIndex(actividad => actividad.id === id);
        if (idx === -1) {
            callback_error("Not Found");
            return;
        }
        actividades.splice(idx, 1);
        console.log(`Actividad con ID ${id} eliminada.`);
    }

    consulta(id: number): IActividad | undefined {
        const actividad = actividades.find(actividad => actividad.id === id);
        if (!actividad) throw new Error("Not Found");
        return actividad;
    }
}