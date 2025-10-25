/**
 * Swagger/OpenAPI Configuration
 *
 * Documents all API endpoints with request/response examples
 * Accessible at /api/docs when server running
 */

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Auto Insurance API')
    .setDescription(
      `OMG Property & Casualty Data Model v1.0 compliant auto insurance purchase platform.

## Features
- Quote generation with multi-driver/vehicle support
- Policy binding with payment processing
- Self-service portal (dashboard, billing, claims)

## ID Format
- Quote Numbers: \`DZXXXXXXXX\` (8 characters after DZ prefix)
- Policy Numbers: \`DZXXXXXXXX\` (8 characters after DZ prefix)

## Progressive-Style Quote Flow
1. Vehicle Info → Add multiple vehicles
2. Primary Driver Info → Basic information
3. Additional Drivers → Add multiple drivers
4. Coverage Selection → Select limits and deductibles
5. Quote Results → Review premium and bind policy

## Policy Status Transitions
\`\`\`
QUOTED → BINDING → BOUND → IN_FORCE
\`\`\`

- **QUOTED**: Initial quote generated
- **BINDING**: Payment processing in progress
- **BOUND**: Payment successful, policy created
- **IN_FORCE**: Policy active and effective
      `
    )
    .setVersion('1.0.0')
    .addTag('Quotes', 'Quote generation and management')
    .addTag('Policies', 'Policy binding and lifecycle')
    .addTag('Portal', 'Self-service portal endpoints')
    .addTag('Rating', 'Premium calculation and rating engine')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Auto Insurance API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
    },
  });
}
