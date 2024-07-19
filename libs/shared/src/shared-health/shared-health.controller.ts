import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class SharedHealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  private instanceSize = 512 * 1024 * 1024;

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', this.instanceSize),
      () => this.memory.checkRSS('memory_rss', this.instanceSize),
    ]);
  }
}
