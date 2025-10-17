import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfessorsService } from './professors.service';
import { ProfessorsController } from './professors.controller';
import { Profesor } from './entities/profesor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesor])],
  providers: [ProfessorsService],
  controllers: [ProfessorsController]
})
export class ProfessorsModule {}
