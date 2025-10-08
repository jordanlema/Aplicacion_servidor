import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Curso } from '../models/cursos.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SKILLVERSE';

  cursos: Curso[] = [
    {
      titulo: 'Inglés Básico',
      descripcion: 'Aprende inglés desde cero con clases interactivas.',
      logros: 3,
      certificado: 'active',
      duracion: '4 semanas',
      temas: [
      'Saludos y presentaciones',
      'Números y alfabeto',
      'Colores y objetos comunes',
      'Gramática básica (verbo to be)',
      'Vocabulario cotidiano',
      'Formación de frases simples'
      ]
    },
    {
      titulo: 'Guitarra para Principiantes',
      descripcion: 'Domina los acordes básicos y toca tus primeras canciones.',
      logros: 1,
      certificado: 'desactive',
      duracion: '2 semanas',
      temas: [
      'Saludos y presentaciones',
      'canciones',
      'toca bien',
      'do,re,mi,fa,sol',
      'bad bunny',
      'terminamos'
      ]
    },
    {
      titulo: 'Francés Intermedio',
      descripcion: 'Mejora tu nivel con gramática y conversación.',
      logros: 5,
      certificado: 'active',
      duracion: '6 semanas',
      temas: [
      'Saludos y presentaciones',
      'Números y alfabeto',
      'Colores y objetos comunes',
      'Gramática intermedio',
      'Vocabulario cotidiano',
      'Formación de frases simples'
      ]
    },
    {
      titulo: 'Ingles Avanzado',
      descripcion: 'Mejora tu nivel con lecciones y actividades.',
      logros: 3,
      certificado: 'active',
      duracion: '4 semanas',
      temas: [
      'Saludos y presentaciones',
      'Números y alfabeto',
      'Colores y objetos comunes',
      'Gramática básica (verbo to be)',
      'Vocabulario cotidiano',
      'Formación de frases simples'
      ]
    }
  ];

  cursoSeleccionado: Curso | null = null;

  abrirDetalles(curso: Curso) {
    this.cursoSeleccionado = curso;
  }

  cerrarDetalles() {
    this.cursoSeleccionado = null;
  }
}
