import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Actividad } from './entities/actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actividad])],
  providers: [ActivitiesService],
  controllers: [ActivitiesController]
})
export class ActivitiesModule {}
