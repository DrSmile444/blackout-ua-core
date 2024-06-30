import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.info('Server is running on port 3000');
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
