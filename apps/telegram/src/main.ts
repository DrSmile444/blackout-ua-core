import { ConfigService } from '@nestjs/config';
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

  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('TELEGRAM_PORT') || configService.get<string>('PORT') || 3000;

  await app.listen(port);
  console.info(`Telegram is running on port ${port}`);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
