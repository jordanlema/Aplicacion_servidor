import type usuario = require("./usuarios");
import type curso = require("./curso");

export interface IActividad {
    id: number;
    titulo: string;
    descripcion: string;
    cursoId: number;
    profesor: usuario.IUsuario;
}
