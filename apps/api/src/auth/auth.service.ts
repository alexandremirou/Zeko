import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username: dto.username }],
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Cette adresse email est déjà utilisée.');
      }

      throw new ConflictException('Ce nom d’utilisateur est déjà utilisé.');
    }

    const passwordHash = await hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        username: dto.username,
        displayName: dto.displayName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const passwordIsValid = await verify(user.passwordHash, dto.password);

    if (!passwordIsValid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: new Date(
          Date.now() +
            Number.parseInt(
              this.configService.getOrThrow<string>('JWT_REFRESH_TTL'),
              10,
            ) *
              24 *
              60 *
              60 *
              1000,
        ),
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      sid: session.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TTL',
      ) as `${number}d`,
    });

    const refreshTokenHash = await hash(refreshToken);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        status: user.status,
        createdAt: user.createdAt,
      },
    };
  }

  async refreshTokens(userId: string, sessionId: string, refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token invalide.');
    }

    const refreshTokenIsValid = await verify(
      session.refreshTokenHash,
      refreshToken,
    ).catch(() => false);

    if (!refreshTokenIsValid) {
      throw new UnauthorizedException('Refresh token invalide.');
    }

    const payload = {
      sub: session.user.id,
      email: session.user.email,
      sid: session.id,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TTL',
      ) as `${number}d`,
    });

    const newRefreshTokenHash = await hash(newRefreshToken);

    const expiresAt = new Date(
      Date.now() +
        Number.parseInt(
          this.configService.getOrThrow<string>('JWT_REFRESH_TTL'),
          10,
        ) *
          24 *
          60 *
          60 *
          1000,
    );

    const rotation = await this.prisma.session.updateMany({
      where: {
        id: session.id,
        userId,
        refreshTokenHash: session.refreshTokenHash,
        expiresAt: { gt: new Date() },
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
      },
    });

    if (rotation.count !== 1) {
      throw new UnauthorizedException('Refresh token invalide.');
    }

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(userId: string, sessionId: string) {
    await this.prisma.session.deleteMany({
      where: { id: sessionId, userId },
    });

    return { message: 'Déconnexion réussie.' };
  }
}
