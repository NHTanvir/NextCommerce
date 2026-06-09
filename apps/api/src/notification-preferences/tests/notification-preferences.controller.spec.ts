import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPreferencesController } from '../notification-preferences.controller';
import { NotificationPreferencesService } from '../notification-preferences.service';
import type { UserPayload } from '../../auth/types/user-payload.type';

const mockUser: UserPayload = { sub: 'user-ctrl-1', email: 'test@example.com', role: 'user' };

describe('NotificationPreferencesController', () => {
  let controller: NotificationPreferencesController;
  let service: NotificationPreferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferencesController],
      providers: [NotificationPreferencesService],
    }).compile();

    controller = module.get(NotificationPreferencesController);
    service = module.get(NotificationPreferencesService);
  });

  it('get() returns preferences for current user', () => {
    const result = controller.get(mockUser);
    expect(result.userId).toBe(mockUser.sub);
    expect(typeof result.orderUpdates).toBe('boolean');
  });

  it('update() patches preferences', () => {
    const result = controller.update(mockUser, { smsAlerts: true });
    expect(result.smsAlerts).toBe(true);
    expect(result.userId).toBe(mockUser.sub);
  });

  it('reset() restores defaults', () => {
    controller.update(mockUser, { promotionalEmails: true, smsAlerts: true });
    const reset = controller.reset(mockUser);
    expect(reset.promotionalEmails).toBe(false);
    expect(reset.smsAlerts).toBe(false);
  });

  it('get() after update() reflects changes', () => {
    controller.update(mockUser, { newsletterDigest: false });
    expect(controller.get(mockUser).newsletterDigest).toBe(false);
  });
});
