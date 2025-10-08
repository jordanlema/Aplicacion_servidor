import type usuario = require("./usuarios");
export interface IActividad {
    id: number;
    titulo: string;
    descripcion: string;
    cursoId: number;
    profesor: usuario.IUsuario;
}
//# sourceMappingURL=actividad.d.ts.map