import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { TelegramModule } from './telegram.module';

async function bootstrap() {
  const app = await NestFactory.create(TelegramModule);

  const config = new DocumentBuilder()
    .setTitle('Outrage Telegram API')
    .setDescription('Server to parse messages and store outrages from telegram')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
