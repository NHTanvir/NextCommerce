import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { Notification } from './entities/notification.entity';

export type NotificationEvent = {
  userId: string;
  notification: Pick<Notification, 'id' | 'type' | 'title' | 'body' | 'actionUrl' | 'createdAt'>;
};

@Injectable()
export class NotificationsBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  emit(event: NotificationEvent): void {
    this.emitter.emit('notification.created', event);
  }

  on(handler: (event: NotificationEvent) => void): () => void {
    this.emitter.on('notification.created', handler);
    return () => this.emitter.off('notification.created', handler);
  }
}
