import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!(value instanceof Date) && typeof value !== 'string') return false;
    const date = new Date(value as string | Date);
    if (isNaN(date.getTime())) return false;
    return date > new Date();
  }

  defaultMessage(): string {
    return 'Date must be in the future';
  }
}

export function IsFutureDate(options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
