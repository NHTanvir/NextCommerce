import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackInStockSubscription } from './entities/back-in-stock.entity';
import { BackInStockService } from './back-in-stock.service';
import { BackInStockController } from './back-in-stock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BackInStockSubscription])],
  providers: [BackInStockService],
  controllers: [BackInStockController],
  exports: [BackInStockService],
})
export class BackInStockModule {}
