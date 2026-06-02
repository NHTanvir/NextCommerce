import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseEnumPipe<T extends object> implements PipeTransform<string, T[keyof T]> {
  constructor(private readonly enumType: T) {}

  transform(value: string): T[keyof T] {
    const validValues = Object.values(this.enumType) as string[];
    if (!validValues.includes(value)) {
      throw new BadRequestException(
        `"${value}" is not a valid value. Expected one of: ${validValues.join(', ')}`,
      );
    }
    return value as unknown as T[keyof T];
  }
}
