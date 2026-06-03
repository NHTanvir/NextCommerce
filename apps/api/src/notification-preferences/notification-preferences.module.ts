import { Module } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences.controller';

@Module({
  providers: [NotificationPreferencesService],
  controllers: [NotificationPreferencesController],
  exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
