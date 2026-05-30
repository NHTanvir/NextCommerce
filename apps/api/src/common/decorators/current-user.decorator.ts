import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '@nextcommerce/shared';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: UserPayload }>();
    return request.user;
  },
);
