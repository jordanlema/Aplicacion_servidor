import type { ICurso } from "../domain/curso";
import type { DtoCrearCurso } from "../dto/crear-curso.dto";
export declare class CRUDCurso {
    constructor();
    createCurso(nuevoCurso: DtoCrearCurso): void;
    readCursos(): ICurso[];
    updateCurso(id: number, nuevoCurso: ICurso): void;
    deleteCurso(id: number, callback_error: CallableFunction): void;
    consulta(id: number): ICurso | undefined;
}
//# sourceMappingURL=curso.d.ts.map