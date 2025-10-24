import { Injectable } from '@nestjs/common';

@Injectable()
export class UsuarioService {
  create(createUsuarioInput: any) {
    return 'Esta acción agrega un nuevo usuario';
  }

  findAll() {
    return `Esta acción devuelve todos los usuarios`;
  }

  findOne(id: number) {
    return `Esta acción devuelve el usuario #${id}`;
  }

  update(id: number, updateUsuarioInput: any) {
    return `Esta acción actualiza el usuario #${id}`;
  }

  remove(id: number) {
    return `Esta acción elimina el usuario #${id}`;
  }
}
