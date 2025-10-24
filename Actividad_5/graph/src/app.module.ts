import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { CursoModule } from './curso/curso.module';
import { ProfesorModule } from './profesor/profesor.module';
import { ActividadModule } from './actividad/actividad.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { ProfesorCursosResolver } from './profesor-cursos/profesor-cursos.resolver';
import { ProfesorCursosService } from './profesor-cursos/profesor-cursos.service';
import { ServiceHttp } from './servicios/http.service';
import { CursoEstudiantesResolver } from './curso-estudiantes/curso-estudiantes.resolver';
import { CursoEstudiantesService } from './curso-estudiantes/curso-estudiantes.service';
import { UsuarioActividadesResolver } from './usuario-actividades/usuario-actividades.resolver';
import { UsuarioActividadesService } from './usuario-actividades/usuario-actividades.service';
import { ProfesorEstudiantesResolver } from './profesor-estudiantes/profesor-estudiantes.resolver';
import { ProfesorEstudiantesService } from './profesor-estudiantes/profesor-estudiantes.service';
import { UsuarioCreditosResolver } from './usuario-creditos/usuario-creditos.resolver';
import { UsuarioCreditosService } from './usuario-creditos/usuario-creditos.service';
import { ProfesorCursosEstudiantesResolver } from './profesor-cursos-estudiantes/profesor-cursos-estudiantes.resolver';
import { ProfesorCursosEstudiantesService } from './profesor-cursos-estudiantes/profesor-cursos-estudiantes.service';
import { EstudiantesOrdenadosResolver } from './estudiantes-ordenados/estudiantes-ordenados.resolver';
import { EstudiantesOrdenadosService } from './estudiantes-ordenados/estudiantes-ordenados.service';
import { EstudianteCursosMayorCreditoResolver } from './estudiante-cursos-mayor-credito/estudiante-cursos-mayor-credito.resolver';
import { EstudianteCursosMayorCreditoService } from './estudiante-cursos-mayor-credito/estudiante-cursos-mayor-credito.service';

@Module({
  imports: [
    HttpModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      autoSchemaFile: true
    }),
    UsuarioModule, CursoModule, ProfesorModule, ActividadModule],
  controllers: [AppController],
  providers: [
    AppService, 
    ServiceHttp,
    ProfesorCursosResolver, 
    ProfesorCursosService, 
    CursoEstudiantesResolver,
    CursoEstudiantesService,
    UsuarioActividadesResolver,
    UsuarioActividadesService,
    ProfesorEstudiantesResolver,
    ProfesorEstudiantesService,
    UsuarioCreditosResolver,
    UsuarioCreditosService,
    ProfesorCursosEstudiantesResolver,
    ProfesorCursosEstudiantesService,
    EstudiantesOrdenadosResolver,
    EstudiantesOrdenadosService,
    EstudianteCursosMayorCreditoResolver,
    EstudianteCursosMayorCreditoService
  ],
})
export class AppModule {}
