import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'El título es requerido' })
  @IsString({ message: 'El título debe ser un texto' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsNotEmpty({ message: 'El ID del profesor es requerido' })
  @IsNumber({}, { message: 'El ID del profesor debe ser un número' })
  profesorId: number;

  @IsOptional()
  @IsBoolean({ message: 'Requiere certificado debe ser un valor booleano' })
  requiereCertificado?: boolean;
}
