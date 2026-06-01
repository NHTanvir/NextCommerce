import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../orders/entities/address.entity';
import { CreateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepo.create({
      userId,
      line1: dto.line1,
      line2: dto.line2 ?? null,
      city: dto.city,
      postalCode: dto.postalCode,
      country: dto.countryCode,
    });
    return this.addressRepo.save(address);
  }

  async findByUser(userId: string): Promise<Address[]> {
    return this.addressRepo.find({ where: { userId }, order: { id: 'DESC' } as any });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Not your address');
    return address;
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepo.delete(address.id);
  }
}
