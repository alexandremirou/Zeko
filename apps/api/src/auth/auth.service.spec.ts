import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let testingModule: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    testingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            session: {
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              findFirst: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                JWT_ACCESS_SECRET: 'test-access-secret',
                JWT_REFRESH_SECRET: 'test-refresh-secret',
                JWT_ACCESS_TTL: '15m',
                JWT_REFRESH_TTL: '7d',
              };
              return values[key];
            }),
          },
        },
      ],
    }).compile();

    service = testingModule.get<AuthService>(AuthService);
  });

  it('supprime uniquement la session de l’utilisateur concerné', async () => {
    const prisma = testingModule.get(PrismaService);

    const deleteManySpy = jest
      .spyOn(prisma.session, 'deleteMany')
      .mockResolvedValue({ count: 1 });

    await service.logout('user-1', 'session-1');

    expect(deleteManySpy).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        userId: 'user-1',
      },
    });
  });

  it('refuse la connexion si le mot de passe est incorrect', async () => {
    const prisma = testingModule.get(PrismaService);

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      passwordHash: 'fake-hash',
      avatarUrl: null,
      status: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.mocked(verify).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'MauvaisMotDePasse123!',
      }),
    ).rejects.toThrow('Identifiants invalides.');
  });

  it('refuse le renouvellement si la session est expirée', async () => {
    const prisma = testingModule.get(PrismaService);

    jest.spyOn(prisma.session, 'findFirst').mockResolvedValue(null);

    await expect(
      service.refreshTokens(
        'user-1',
        'session-expired',
        'refresh-token-invalide',
      ),
    ).rejects.toThrow('Refresh token invalide.');
  });

  it('renouvelle le jeton et enregistre son nouveau hachage', async () => {
    const prisma = testingModule.get(PrismaService);
    const jwtService = testingModule.get(JwtService);

    jest.spyOn(prisma.session, 'findFirst').mockResolvedValue({
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'old-hash',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    });

    jest.mocked(verify).mockResolvedValue(true);

    jest
      .mocked(jwtService.signAsync)
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const { hash } = await import('argon2');
    jest.mocked(hash).mockResolvedValue('new-hash');

    jest.spyOn(prisma.session, 'updateMany').mockResolvedValue({ count: 1 });

    await expect(
      service.refreshTokens('user-1', 'session-1', 'old-refresh-token'),
    ).resolves.toEqual({
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
    });

    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        userId: 'user-1',
        refreshTokenHash: 'old-hash',
        expiresAt: { gt: expect.any(Date) },
      },
      data: {
        refreshTokenHash: 'new-hash',
        expiresAt: expect.any(Date),
      },
    });
  });

  it('refuse de réutiliser l’ancien refresh token après sa rotation', async () => {
    const prisma = testingModule.get(PrismaService);
    const jwtService = testingModule.get(JwtService);

    const session = {
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'old-hash',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    };

    jest.spyOn(prisma.session, 'findFirst').mockResolvedValue(session);

    jest
      .spyOn(prisma.session, 'updateMany')
      .mockImplementation(async ({ where, data }) => {
        if (
          session.id !== where.id ||
          session.userId !== where.userId ||
          session.refreshTokenHash !== where.refreshTokenHash ||
          session.expiresAt <= where.expiresAt.gt
        ) {
          return { count: 0 };
        }

        Object.assign(session, data);
        return { count: 1 };
      });

    jest
      .mocked(verify)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const { hash } = await import('argon2');
    jest.mocked(hash).mockResolvedValue('new-hash');

    jest
      .mocked(jwtService.signAsync)
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    await service.refreshTokens('user-1', 'session-1', 'old-refresh-token');

    expect(session.refreshTokenHash).toBe('new-hash');

    await expect(
      service.refreshTokens('user-1', 'session-1', 'old-refresh-token'),
    ).rejects.toThrow('Refresh token invalide.');

    expect(prisma.session.updateMany).toHaveBeenCalledTimes(1);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('refuse la connexion si l’utilisateur est introuvable', async () => {
    const prisma = testingModule.get(PrismaService);

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(
      service.login({
        email: 'inconnu@example.com',
        password: 'MotDePasseInvalide123!',
      }),
    ).rejects.toThrow('Identifiants invalides.');
  });

  it('n’autorise qu’un seul renouvellement simultané avec le même refresh token', async () => {
    const prisma = testingModule.get(PrismaService);
    const jwtService = testingModule.get(JwtService);

    const session = {
      id: 'session-1',
      userId: 'user-1',
      refreshTokenHash: 'old-hash',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        email: 'test@example.com',
      },
    };

    // Les deux requêtes lisent le même état initial.
    jest.spyOn(prisma.session, 'findFirst').mockResolvedValue({
      ...session,
    });

    jest.mocked(verify).mockResolvedValue(true);

    jest
      .mocked(jwtService.signAsync)
      .mockResolvedValueOnce('access-token-1')
      .mockResolvedValueOnce('refresh-token-1')
      .mockResolvedValueOnce('access-token-2')
      .mockResolvedValueOnce('refresh-token-2');

    const { hash } = await import('argon2');
    jest
      .mocked(hash)
      .mockResolvedValueOnce('new-hash-1')
      .mockResolvedValueOnce('new-hash-2');

    // Simule une mise à jour atomique : seul le premier appel
    // qui présente l'ancien hash peut modifier la session.
    jest
      .spyOn(prisma.session, 'updateMany')
      .mockImplementation(async ({ where, data }) => {
        if (
          session.refreshTokenHash !== where.refreshTokenHash ||
          session.expiresAt <= where.expiresAt.gt
        ) {
          return { count: 0 };
        }

        Object.assign(session, data);
        return { count: 1 };
      });

    const results = await Promise.allSettled([
      service.refreshTokens('user-1', 'session-1', 'old-refresh-token'),
      service.refreshTokens('user-1', 'session-1', 'old-refresh-token'),
    ]);

    expect(
      results.filter((result) => result.status === 'fulfilled'),
    ).toHaveLength(1);
    expect(
      results.filter((result) => result.status === 'rejected'),
    ).toHaveLength(1);
    expect(prisma.session.updateMany).toHaveBeenCalledTimes(2);
  });
});
