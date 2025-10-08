import type { IActividad } from "../domain/actividad";
import type { DtoCrearActividad } from "../dto/crear-actividad.dto";
import type { CRUDUsuario } from './usuario';
import type { CRUDCurso } from './curso';
export declare class CRUDActividad {
    private usuarioService;
    private cursoService;
    constructor(usuarioService: CRUDUsuario, cursoService: CRUDCurso);
    createActividad(nuevaActividad: DtoCrearActividad): void;
    readActividades(): IActividad[];
    updateActividad(id: number, nuevaActividad: IActividad): void;
    deleteActividad(id: number, callback_error: CallableFunction): void;
    consulta(id: number): IActividad | undefined;
}
//# sourceMappingURL=actividad.d.ts.map