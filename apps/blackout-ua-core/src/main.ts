import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // This line ensures transformation
      forbidUnknownValues: true,
      // whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Outrage Core Management API')
    .setDescription(
      `
    The Outrage Management API serves as the core component for managing and filtering outrages,
    as well as retrieving available cities and regions. This API enables clients to:

    - Retrieve outrages, with capabilities to filter by various criteria.
    - Manage and query the list of available cities and regions.
    - Integrate with Telegram to parse and store messages from all regions.

    The endpoints provided allow seamless interaction with the outrage data, ensuring
    efficient data storage and retrieval mechanisms.
  `,
    )
    .setVersion('1.4.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('PORT') || 3000;

  await app.listen(port);
  console.info(`Server is running on port ${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
