import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@/auth/types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return req.user;
  },
);
