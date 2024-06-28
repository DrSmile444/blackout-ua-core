import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
  getHello(): string {
    return 'Hello World!';
  }
}
