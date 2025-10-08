import type { IUsuario } from "../domain/usuarios";
import type { DtoCrearUsuario } from "../dto/crear-usuario.dto";


const usuarios: IUsuario[] = [
    { id: 'prof-1', nombre: 'Profesor Base', email: 'profesor@school.edu', rol: 'profesor' },
    { id: 'stu-101', nombre: 'Estudiante Base', email: 'estudiante@student.edu', rol: 'estudiante' },
];


export class CRUDUsuario {
    constructor() {
        console.log("CRUDUsuario iniciado");
    }

    createUsuario(nuevoUsuario: DtoCrearUsuario): IUsuario {
        if (usuarios.some(u => u.email === nuevoUsuario.email)) {
            throw new Error(`[CRUDUsuario] El email ${nuevoUsuario.email} ya está en uso.`);
        }

        const usuario: IUsuario = {
            id: nuevoUsuario.rol === 'PROFESOR' ? `prof-${Date.now()}` : `stu-${Date.now()}`,
            nombre: nuevoUsuario.nombre,
            email: nuevoUsuario.email,
            rol: nuevoUsuario.rol.toLowerCase() as 'profesor' | 'estudiante',
        };

        usuarios.push(usuario);
        return usuario;
    }

    readUsuarios(): IUsuario[] {
        return usuarios;
    }

    consulta(id: string): IUsuario | undefined {
        const usuario = usuarios.find(u => u.id === id);
        return usuario;
    }

    updateUsuario(id: string, datosActualizados: IUsuario): IUsuario {
        const idx = usuarios.findIndex(u => u.id === id);
        if (idx === -1) throw new Error("[CRUDUsuario] Usuario no encontrado para actualizar.");
        
        
        usuarios[idx] = datosActualizados;
        return usuarios[idx];
    }

    deleteUsuario(id: string, callback_error:CallableFunction): void {
        const idx = usuarios.findIndex(u => u.id === id);
        if (idx === -1) throw new Error("[CRUDUsuario] Usuario no encontrado para eliminar.");
        
        usuarios.splice(idx, 1);
        console.log(`[CRUDUsuario] Usuario con ID ${id} eliminado.`);
    }
}
