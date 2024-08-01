import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, MemoryHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';

@ApiTags('app')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  private instanceSize = 512 * 1024 * 1024;

  // eslint-disable-next-line @darraghor/nestjs-typed/api-method-should-specify-api-response
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.database.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', this.instanceSize),
      () =>
        this.http.responseCheck('telegram', `${this.configService.get('TELEGRAM_API_URL')}/health`, (response) => response.status === 200),
      () =>
        this.http.responseCheck('scrapper', `${this.configService.get('SCRAPPER_API_URL')}/health`, (response) => response.status === 200),
    ]);
  }
}
