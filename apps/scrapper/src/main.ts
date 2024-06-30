import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ScrapperModule } from './scrapper.module';

async function bootstrap() {
  const app = await NestFactory.create(ScrapperModule);

  const config = new DocumentBuilder()
    .setTitle('Outrage Scrapper API')
    .setDescription('Server to parse sites and store outrages from them')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
