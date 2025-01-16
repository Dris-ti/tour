import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie-parser middleware
  app.use(cookieParser());
  // To use the backend to all frontend.
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
