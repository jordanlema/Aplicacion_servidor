export interface IUsuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'profesor' | 'estudiante'
}