import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './api/middleware/error-handler';
import { getCorsConfig, getSecurityHeaders } from './api/middleware/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors(getCorsConfig());

  // Apply security headers to all responses
  app.use((req, res, next) => {
    const headers = getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  });

  // Global exception filter for error handling
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation setup
  const config = new DocumentBuilder()
    .setTitle('Auto Insurance API')
    .setDescription('OMG P&C Data Model v1.0 Compliant Auto Insurance Purchase Flow API')
    .setVersion('1.0')
    .addTag('quotes', 'Quote generation and management')
    .addTag('policies', 'Policy binding and management')
    .addTag('portal', 'Self-service portal endpoints')
    .addTag('rating', 'Premium calculation and rating engine')
    .addTag('mock-services', 'Simulated third-party services')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
