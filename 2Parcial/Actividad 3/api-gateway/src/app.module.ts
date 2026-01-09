import { Module } from '@nestjs/common';
import { InscripcionModule } from './inscripcion/inscripcion.module';
import { McpClientModule } from './mcp-client/mcp-client.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    McpClientModule,
    GeminiModule,
    InscripcionModule,
  ],
})
export class AppModule {}
