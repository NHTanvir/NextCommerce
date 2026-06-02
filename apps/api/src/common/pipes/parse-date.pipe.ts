import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string): Date {
    if (!value) throw new BadRequestException('Date parameter is required');
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date: "${value}". Use ISO 8601 format (e.g. 2025-01-01)`);
    }
    return date;
  }
}
