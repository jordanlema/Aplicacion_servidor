import type usuario = require("./usuarios");
import type actividad = require("./actividad");
export interface ICurso {
    id: number;
    titulo: string;
    descripcion: string;
    profesor: usuario.IUsuario;
    actividades: actividad.IActividad[];
    estudiantesInscritos: usuario.IUsuario[];
}
//# sourceMappingURL=curso.d.ts.map