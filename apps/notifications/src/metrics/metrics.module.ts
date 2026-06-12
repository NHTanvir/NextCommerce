import { Global, Module } from '@nestjs/common';
import { MetricsCounter } from './metrics.counter';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsCounter],
  exports: [MetricsCounter],
})
export class MetricsModule {}
