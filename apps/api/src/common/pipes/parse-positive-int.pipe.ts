import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      throw new BadRequestException(`"${value}" is not a valid positive integer`);
    }
    return num;
  }
}
