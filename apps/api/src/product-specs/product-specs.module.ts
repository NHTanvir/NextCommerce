import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSpec } from './entities/product-spec.entity';
import { ProductSpecsService } from './product-specs.service';
import { ProductSpecsController } from './product-specs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSpec])],
  providers: [ProductSpecsService],
  controllers: [ProductSpecsController],
  exports: [ProductSpecsService],
})
export class ProductSpecsModule {}
