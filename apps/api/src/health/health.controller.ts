import { Controller, Get, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

export interface ReadyResponse {
  status: 'ok' | 'degraded';
  dependencies: { database: 'up' | 'down' };
  timestamp: string;
}

export interface LiveResponse {
  status: 'ok';
  timestamp: string;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe — is the process running?' })
  live(): LiveResponse {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — checks dependencies' })
  @ApiResponse({ status: 200, description: 'All dependencies are up' })
  @ApiResponse({ status: 503, description: 'One or more dependencies are down' })
  async ready(): Promise<ReadyResponse> {
    const dbUp = await this.healthService.isDbReady();
    const body: ReadyResponse = {
      status: dbUp ? 'ok' : 'degraded',
      dependencies: { database: dbUp ? 'up' : 'down' },
      timestamp: new Date().toISOString(),
    };
    if (!dbUp) {
      throw new HttpException(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return body;
  }
}
