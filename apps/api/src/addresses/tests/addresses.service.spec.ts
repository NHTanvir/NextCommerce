import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { AddressesService } from '../addresses.service';
import { Address } from '../../orders/entities/address.entity';

const mockRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const baseAddress: Address = {
  id: 'addr-1',
  userId: 'user-1',
  line1: '123 Main St',
  line2: null,
  city: 'New York',
  country: 'US',
  postalCode: '10001',
} as unknown as Address;

describe('AddressesService', () => {
  let service: AddressesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressesService,
        { provide: getRepositoryToken(Address), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AddressesService>(AddressesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates and saves a new address', async () => {
      mockRepo.create.mockReturnValue(baseAddress);
      mockRepo.save.mockResolvedValue(baseAddress);

      const dto = {
        fullName: 'John Doe',
        line1: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        countryCode: 'US',
      };

      const result = await service.create('user-1', dto);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', line1: '123 Main St' }),
      );
      expect(result).toEqual(baseAddress);
    });

    it('stores null for optional line2 when not provided', async () => {
      mockRepo.create.mockReturnValue(baseAddress);
      mockRepo.save.mockResolvedValue(baseAddress);

      await service.create('user-1', {
        fullName: 'John Doe',
        line1: '123 Main St',
        city: 'NYC',
        postalCode: '10001',
        countryCode: 'US',
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ line2: null }),
      );
    });
  });

  describe('findByUser', () => {
    it('returns all addresses for a user', async () => {
      const addresses = [baseAddress];
      mockRepo.find.mockResolvedValue(addresses);

      const result = await service.findByUser('user-1');

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
      expect(result).toEqual(addresses);
    });
  });

  describe('findOne', () => {
    it('returns address if userId matches', async () => {
      mockRepo.findOne.mockResolvedValue(baseAddress);
      const result = await service.findOne('addr-1', 'user-1');
      expect(result).toEqual(baseAddress);
    });

    it('throws NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException if userId mismatch', async () => {
      mockRepo.findOne.mockResolvedValue(baseAddress);
      await expect(service.findOne('addr-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deletes the address after ownership check', async () => {
      mockRepo.findOne.mockResolvedValue(baseAddress);
      mockRepo.delete.mockResolvedValue({});

      await service.remove('addr-1', 'user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('addr-1');
    });

    it('throws ForbiddenException if address belongs to different user', async () => {
      mockRepo.findOne.mockResolvedValue(baseAddress);
      await expect(service.remove('addr-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
});
