import { ConfigService } from '@nestjs/config';
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

  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('SCRAPPER_PORT') || configService.get<string>('PORT') || 3000;

  await app.listen(port);
  console.info(`Scrapper is running on port ${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
