import { Injectable } from '@nestjs/common';

export interface NotificationPreferences {
  userId: string;
  orderUpdates: boolean;
  promotionalEmails: boolean;
  lowStockAlerts: boolean;
  newsletterDigest: boolean;
  pushNotifications: boolean;
  smsAlerts: boolean;
  updatedAt: string;
}

// In-memory store for demo — production would use a DB table
const store = new Map<string, NotificationPreferences>();

function defaults(userId: string): NotificationPreferences {
  return {
    userId,
    orderUpdates: true,
    promotionalEmails: false,
    lowStockAlerts: false,
    newsletterDigest: true,
    pushNotifications: true,
    smsAlerts: false,
    updatedAt: new Date().toISOString(),
  };
}

@Injectable()
export class NotificationPreferencesService {
  getPreferences(userId: string): NotificationPreferences {
    return store.get(userId) ?? defaults(userId);
  }

  updatePreferences(userId: string, updates: Partial<Omit<NotificationPreferences, 'userId' | 'updatedAt'>>): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    store.set(userId, updated);
    return updated;
  }

  resetToDefaults(userId: string): NotificationPreferences {
    const prefs = defaults(userId);
    store.set(userId, prefs);
    return prefs;
  }

  shouldSendEmail(userId: string, type: keyof Omit<NotificationPreferences, 'userId' | 'updatedAt'>): boolean {
    const prefs = this.getPreferences(userId);
    return prefs[type] === true;
  }
}
