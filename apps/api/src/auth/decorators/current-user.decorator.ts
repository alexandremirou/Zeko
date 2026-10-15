import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  <T = unknown>(_data: unknown, ctx: ExecutionContext): T => {
    const req = ctx.switchToHttp().getRequest<{ user: T }>();
    return req.user;
  },
);
