export interface Curso {
  titulo: string;
  descripcion: string;
  logros: number;
  certificado: 'active' | 'desactive';
  temas?: string[];         
  duracion?: string;        
  nivel?: 'Básico' | 'Intermedio' | 'Avanzado';
}
