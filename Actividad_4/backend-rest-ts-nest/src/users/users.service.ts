import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUserDto) {
    const usuario = await this.usuarioRepository.save(createUsuarioDto);
    return usuario;
  }

  async findAll() {
    return this.usuarioRepository.find();
  }

  async findOne(id: string) {
    const usuario = await this.usuarioRepository.findOneBy({ id: parseInt(id) });
    if (!usuario) 
      throw new NotFoundException(`El usuario con id ${id} no existe`);
    return usuario;
  }

  async update(id: string, updateUsuarioDto: Partial<CreateUserDto>) {
    const usuario = await this.usuarioRepository.findOneBy({ id: parseInt(id) });
    if (!usuario) 
      throw new NotFoundException(`El usuario con id ${id} no existe`);
    await this.usuarioRepository.update(parseInt(id), updateUsuarioDto);
    return await this.usuarioRepository.findOneBy({ id: parseInt(id) });
  }

  async remove(id: string) {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }
}