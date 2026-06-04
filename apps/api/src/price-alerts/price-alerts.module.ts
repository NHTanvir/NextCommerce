import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceAlert } from './entities/price-alert.entity';
import { PriceAlertsService } from './price-alerts.service';
import { PriceAlertsController } from './price-alerts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PriceAlert])],
  providers: [PriceAlertsService],
  controllers: [PriceAlertsController],
  exports: [PriceAlertsService],
})
export class PriceAlertsModule {}
