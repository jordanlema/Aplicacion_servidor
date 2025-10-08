import type { IUsuario } from "../domain/usuarios";
import type { DtoCrearUsuario } from "../dto/crear-usuario.dto";
export declare class CRUDUsuario {
    constructor();
    createUsuario(nuevoUsuario: DtoCrearUsuario): IUsuario;
    readUsuarios(): IUsuario[];
    consulta(id: string): IUsuario | undefined;
    updateUsuario(id: string, datosActualizados: IUsuario): IUsuario;
    deleteUsuario(id: string, callback_error: CallableFunction): void;
}
//# sourceMappingURL=usuario.d.ts.map