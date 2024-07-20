import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

import { TelegramHealthIndicator } from './telegram.health';

@Controller('health')
export class TelegramHealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private telegramHealthIndicator: TelegramHealthIndicator,
  ) {}

  private instanceSize = 512 * 1024 * 1024;

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.telegramHealthIndicator.isHealthy('telegram'),
      () => this.database.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', this.instanceSize),
      () => this.memory.checkRSS('memory_rss', this.instanceSize),
    ]);
  }
}
