import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogImportService } from './catalog-import.service';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductVariant } from './entities/product-variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, ProductVariant])],
  controllers: [CatalogController],
  providers: [CatalogService, CatalogImportService],
  exports: [CatalogService, CatalogImportService],
})
export class CatalogModule {}
