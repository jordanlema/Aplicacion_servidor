import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty({ message: 'El enunciado es obligatorio' })
  @IsString({ message: 'El enunciado debe ser un texto' })
  enunciado: string;

  @IsNotEmpty({ message: 'La respuesta correcta es obligatoria' })
  @IsString({ message: 'La respuesta correcta debe ser un texto' })
  respuestaCorrecta: string;
}
