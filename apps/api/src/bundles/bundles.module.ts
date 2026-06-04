import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductBundle } from './entities/bundle.entity';
import { BundlesService } from './bundles.service';
import { BundlesController } from './bundles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductBundle])],
  providers: [BundlesService],
  controllers: [BundlesController],
  exports: [BundlesService],
})
export class BundlesModule {}
