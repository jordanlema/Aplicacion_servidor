import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProfessorDto {
  @IsNotEmpty({ message: 'La experiencia es requerida' })
  @IsString({ message: 'La experiencia debe ser un texto' })
  experiencia: string;

  @IsNotEmpty({ message: 'El estado es requerido' })
  @IsString()
  estado: string;

  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
  usuarioId: number;
}
