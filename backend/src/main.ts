import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './api/middleware/error-handler';
import { getCorsConfig, getSecurityHeaders } from './api/middleware/cors';
import { setupSwagger } from './api/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend communication
  app.enableCors(getCorsConfig());

  // Apply security headers to all responses
  app.use((req: any, res: any, next: any) => {
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
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation setup
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Backend API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
