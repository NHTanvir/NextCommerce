import { Test, TestingModule } from '@nestjs/testing';
import { AddressesController } from '../addresses.controller';
import { AddressesService } from '../addresses.service';
import { CreateAddressDto } from '../dto/address.dto';
import { UserPayload } from '@nextcommerce/shared';

const mockService = {
  findByUser: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
};

const mockUser: UserPayload = {
  sub: 'user-uuid-1',
  id: 'user-uuid-1',
  email: 'test@test.com',
  role: 'customer',
};

describe('AddressesController', () => {
  let controller: AddressesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressesController],
      providers: [{ provide: AddressesService, useValue: mockService }],
    }).compile();

    controller = module.get(AddressesController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns addresses for the current user', async () => {
      const addresses = [{ id: 'addr-1' }, { id: 'addr-2' }];
      mockService.findByUser.mockResolvedValue(addresses);
      const result = await controller.findAll(mockUser);
      expect(mockService.findByUser).toHaveBeenCalledWith('user-uuid-1');
      expect(result).toBe(addresses);
    });
  });

  describe('create', () => {
    it('creates address for current user', async () => {
      const dto: CreateAddressDto = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '90210',
        country: 'US',
      } as CreateAddressDto;
      const address = { id: 'addr-new', ...dto, userId: 'user-uuid-1' };
      mockService.create.mockResolvedValue(address);
      const result = await controller.create(mockUser, dto);
      expect(mockService.create).toHaveBeenCalledWith('user-uuid-1', dto);
      expect(result).toBe(address);
    });
  });

  describe('remove', () => {
    it('removes address by id for current user', async () => {
      mockService.remove.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'addr-1');
      expect(mockService.remove).toHaveBeenCalledWith('addr-1', 'user-uuid-1');
    });
  });
});
