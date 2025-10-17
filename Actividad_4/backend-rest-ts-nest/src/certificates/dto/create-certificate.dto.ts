import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateCertificateDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de emisión debe ser una fecha válida' })
  fechaEmision?: Date;

  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString({ message: 'El código de verificación debe ser un texto' })
  codigoVerificacion: string;

  @IsOptional()
  @IsString({ message: 'La URL del PDF debe ser un texto' })
  urlPDF?: string;

  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId: number;

  @IsNotEmpty({ message: 'El ID del curso es requerido' })
  @IsNumber({}, { message: 'El ID del curso debe ser un número' })
  cursoId: number;
}
