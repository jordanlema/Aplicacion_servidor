import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Pregunta } from './entities/pregunta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pregunta])],
  providers: [QuestionsService],
  controllers: [QuestionsController]
})
export class QuestionsModule {}
