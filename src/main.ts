import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // to make all routes start with /api (common in REST APIS)
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  // to apply automatic validation for class-validator library
  // whitelist: true serves to ignore properties sent that are not part of the dto
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // to read cookies from incoming requests
  app.use(cookieParser());
  // enabling requests from all origins

  // configuring swagger to visualize created endpoints
  const options = new DocumentBuilder()
    .setTitle('TutorHub API')
    .setDescription('tutorhub api')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(3001);
}
bootstrap();
