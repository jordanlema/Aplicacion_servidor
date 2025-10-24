import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const usuarios = [{
  id: "1",
  nombre: "Pedro",
  correo: "pedro@gmail.com"
},
{
  id: "2",
  nombre: "Juan",
  correo: "juan@gmail.com"
},
{
  id: "3",
  nombre: "Miquel",
  correo: "miquel@gmail.com"
}]

@Injectable()
export class UsuarioService {

  findAll() {
    return usuarios
  }

  findOne(id: string) {
    const usuario = usuarios.find((usuario)=>usuario.id === id)
    return usuario
  }

}
