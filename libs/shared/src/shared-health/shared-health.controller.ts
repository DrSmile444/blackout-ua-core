import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@ApiTags('app')
@Controller('health')
export class SharedHealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  private instanceSize = 512 * 1024 * 1024;

  // eslint-disable-next-line @darraghor/nestjs-typed/api-method-should-specify-api-response
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
