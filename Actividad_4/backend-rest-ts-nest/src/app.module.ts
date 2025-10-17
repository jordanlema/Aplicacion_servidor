import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './users/entities/usuario.entity';
import { Profesor } from './professors/entities/profesor.entity';
import { Curso } from './courses/entities/curso.entity';
import { Actividad } from './activities/entities/actividad.entity';
import { Pregunta } from './questions/entities/pregunta.entity';
import { Certificado } from './certificates/entities/certificado.entity';

import { UsersModule } from './users/users.module';
import { ProfessorsModule } from './professors/professors.module';
import { CoursesModule } from './courses/courses.module';
import { ActivitiesModule } from './activities/activities.module';
import { QuestionsModule } from './questions/questions.module';
import { CertificatesModule } from './certificates/certificates.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',   
      password: 'admin123',           
      database: 'educa_db',   
      entities: [Usuario, Profesor, Curso, Actividad, Pregunta, Certificado],
      synchronize: true,
    }),
    UsersModule,
    ProfessorsModule,
    CoursesModule,
    ActivitiesModule,
    QuestionsModule,
    CertificatesModule,
  ],
})
export class AppModule {}
