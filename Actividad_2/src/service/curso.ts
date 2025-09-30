import type { ICurso } from "../domain/curso";
import type { DtoCrearCurso } from "../dto/crear-curso.dto";

const cursos: ICurso[] = [];

export class CRUDCurso {
    constructor() {
        console.log("CRUDCurso iniciado");
    }

    createCurso(nuevoCurso: DtoCrearCurso): void {
        const curso: ICurso = {
            id: cursos.length + 1,
            titulo: nuevoCurso.titulo,
            descripcion: nuevoCurso.descripcion,
            profesor: { id: nuevoCurso.profesorId } as any,
            actividades: [],
            estudiantesInscritos: []
        };

        cursos.push(curso);
    }

    readCursos(): ICurso[] {
        return cursos;
    }

    updateCurso(id: number, nuevoCurso: ICurso): void {
        const idx = cursos.findIndex(curso => curso.id === id);
        if (idx === -1) return console.log("Not Found");
        cursos[idx] = nuevoCurso;
    }

    deleteCurso(id: number, callback_error: CallableFunction): void {
        const idx = cursos.findIndex(curso => curso.id === id);
        if (idx === -1) {
            callback_error("Not Found");
            return;
        }
        cursos.splice(idx, 1);
    }

    consulta(id: number): ICurso | undefined {
        const curso = cursos.find(curso => curso.id === id);
        if (!curso) throw new Error("Not Found");
        return curso;
    }
}
