export interface DtoCrearUsuario {
    nombre: string;
    email: string;
    password: string;
    rol: 'ESTUDIANTE' | 'PROFESOR';
}
