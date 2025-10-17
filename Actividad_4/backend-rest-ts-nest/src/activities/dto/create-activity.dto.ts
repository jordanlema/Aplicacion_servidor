import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateActivityDto {
  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  @IsNumber({}, { message: 'El ID del curso debe ser un número' })
  cursoId: number;

  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString({ message: 'El título debe ser un texto' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;
}
