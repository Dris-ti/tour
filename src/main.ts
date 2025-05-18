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
  // app.enableCors()

  // To enable cookies
  app.enableCors({
    origin: 'https://tour-frontend-1woq.onrender.com', // Must match your frontend domain
    credentials: true,
  });

  
  await app.listen(process.env.PORT ?? 17288);
}
bootstrap();
