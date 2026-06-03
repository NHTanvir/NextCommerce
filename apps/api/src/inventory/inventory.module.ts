import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryAlertService } from './inventory-alert.service';
import { ProductVariant } from '../catalog/entities/product-variant.entity';
import { Product } from '../catalog/entities/product.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Product]), EventsModule],
  providers: [InventoryService, InventoryAlertService],
  controllers: [InventoryController],
  exports: [InventoryService, InventoryAlertService],
})
export class InventoryModule {}
