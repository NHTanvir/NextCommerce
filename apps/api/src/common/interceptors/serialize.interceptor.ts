import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance, ClassConstructor } from 'class-transformer';

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private readonly dto: ClassConstructor<T>) {}

  intercept(_ctx: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: unknown) =>
        plainToInstance(this.dto, data, { excludeExtraneousValues: true }),
      ),
    );
  }
}
