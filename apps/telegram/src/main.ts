import { NestFactory } from '@nestjs/core';

import { TelegramModule } from './telegram.module';

async function bootstrap() {
  const app = await NestFactory.create(TelegramModule);
  await app.listen(3001);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
