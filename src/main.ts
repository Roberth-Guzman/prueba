import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Servidor backend corriendo en http://localhost:3000');
}
bootstrap();
