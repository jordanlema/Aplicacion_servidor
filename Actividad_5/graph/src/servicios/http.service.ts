import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Curso } from 'src/curso/entities/curso.entity';
import { Profesor } from 'src/profesor/entities/profesor.entity';
import { Actividad } from 'src/actividad/entities/actividad.entity';

@Injectable()
export class ServiceHttp {
  private readonly logger = new Logger(ServiceHttp.name);
  constructor(private readonly httpService: HttpService) {}

  async findAllUsuarios(): Promise<Usuario[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Usuario[]>('http://localhost:3000/api/usuario').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findAllCursos(): Promise<Curso[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Curso[]>('http://localhost:3000/api/curso').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findAllProfesores(): Promise<Profesor[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Profesor[]>('http://localhost:3000/api/profesor').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findAllActividades(): Promise<Actividad[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Actividad[]>('http://localhost:3000/api/actividad').pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findUsuario(id: string): Promise<Usuario> {
    const { data } = await firstValueFrom(
      this.httpService.get<Usuario>(`http://localhost:3000/api/usuario/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findCurso(id: string): Promise<Curso> {
    const { data } = await firstValueFrom(
      this.httpService.get<Curso>(`http://localhost:3000/api/curso/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findProfesor(id: string): Promise<Profesor> {
    const { data } = await firstValueFrom(
      this.httpService.get<Profesor>(`http://localhost:3000/api/profesor/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }

  async findActividad(id: string): Promise<Actividad> {
    const { data } = await firstValueFrom(
      this.httpService.get<Actividad>(`http://localhost:3000/api/actividad/${id}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened!';
        }),
      ),
    );
    return data;
  }
}