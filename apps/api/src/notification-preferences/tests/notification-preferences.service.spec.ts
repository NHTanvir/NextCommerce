import { NotificationPreferencesService } from '../notification-preferences.service';

describe('NotificationPreferencesService', () => {
  let service: NotificationPreferencesService;

  beforeEach(() => {
    service = new NotificationPreferencesService();
  });

  describe('getPreferences', () => {
    it('returns defaults for a new user', () => {
      const prefs = service.getPreferences('user-1');
      expect(prefs.userId).toBe('user-1');
      expect(prefs.orderUpdates).toBe(true);
      expect(prefs.promotionalEmails).toBe(false);
      expect(prefs.lowStockAlerts).toBe(false);
      expect(prefs.newsletterDigest).toBe(true);
      expect(prefs.pushNotifications).toBe(true);
      expect(prefs.smsAlerts).toBe(false);
      expect(typeof prefs.updatedAt).toBe('string');
    });

    it('returns stored prefs after update', () => {
      service.updatePreferences('user-2', { promotionalEmails: true });
      const prefs = service.getPreferences('user-2');
      expect(prefs.promotionalEmails).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('merges partial updates', () => {
      const result = service.updatePreferences('user-3', { smsAlerts: true, lowStockAlerts: true });
      expect(result.smsAlerts).toBe(true);
      expect(result.lowStockAlerts).toBe(true);
      expect(result.orderUpdates).toBe(true);
    });

    it('updates updatedAt timestamp', () => {
      const before = new Date().toISOString();
      const result = service.updatePreferences('user-4', { smsAlerts: true });
      expect(result.updatedAt >= before).toBe(true);
    });

    it('persists across multiple calls', () => {
      service.updatePreferences('user-5', { promotionalEmails: true });
      service.updatePreferences('user-5', { smsAlerts: true });
      const prefs = service.getPreferences('user-5');
      expect(prefs.promotionalEmails).toBe(true);
      expect(prefs.smsAlerts).toBe(true);
    });
  });

  describe('resetToDefaults', () => {
    it('resets customised prefs to defaults', () => {
      service.updatePreferences('user-6', { promotionalEmails: true, smsAlerts: true });
      const reset = service.resetToDefaults('user-6');
      expect(reset.promotionalEmails).toBe(false);
      expect(reset.smsAlerts).toBe(false);
      expect(reset.orderUpdates).toBe(true);
    });

    it('returns the stored default after reset', () => {
      service.resetToDefaults('user-7');
      expect(service.getPreferences('user-7').newsletterDigest).toBe(true);
    });
  });

  describe('shouldSendEmail', () => {
    it('returns true for enabled preference', () => {
      expect(service.shouldSendEmail('user-8', 'orderUpdates')).toBe(true);
    });

    it('returns false for disabled preference', () => {
      expect(service.shouldSendEmail('user-9', 'promotionalEmails')).toBe(false);
    });

    it('reflects updated preference', () => {
      service.updatePreferences('user-10', { promotionalEmails: true });
      expect(service.shouldSendEmail('user-10', 'promotionalEmails')).toBe(true);
    });
  });
});
