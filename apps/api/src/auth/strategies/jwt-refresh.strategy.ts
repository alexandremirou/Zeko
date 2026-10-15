import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { RefreshAuthUser } from '../types/auth-user';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    payload: { sub: string; email: string; sid: string },
  ): RefreshAuthUser {
    if (!payload.sub || !payload.email || !payload.sid) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      refreshToken,
      sessionId: payload.sid,
    };
  }
}
