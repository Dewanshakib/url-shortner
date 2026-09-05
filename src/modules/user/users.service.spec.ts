import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service.js';
import { PrismaService } from '../../database/prisma.service.js';

describe('UserService', () => {
  let service: UserService;
  let prisma: { user: { findFirst: jest.Mock<(args: any) => Promise<any>> } };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findOne', () => {
    it('should return the user when found', async () => {
      const user = { id: 1, name: 'John', email: 'john@example.com' };
      prisma.user.findFirst.mockResolvedValue(user);

      const result = await service.findOne('john@example.com');

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'john@example.com' },
      });
      expect(result).toEqual(user);
    });

    it('should return null when no user exists with the email', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      const result = await service.findOne('missing@example.com');

      expect(result).toBeNull();
    });
  });
});
