import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthService } from './auth.service.js';
import { UserService } from '../user/users.service.js';
import { PrismaService } from '../../database/prisma.service.js';

const mockHash = jest.fn<(password: string, salt: number) => Promise<string>>();
const mockCompare =
  jest.fn<(password: string, hash: string) => Promise<boolean>>();

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    hash: mockHash,
    compare: mockCompare,
  },
}));

const { AuthService: AuthServiceClass } = await import('./auth.service.js');

describe('AuthService', () => {
  let service: AuthService;
  let userService: { findOne: jest.Mock<(email: string) => Promise<any>> };
  let prisma: {
    user: {
      create: jest.Mock<(args: any) => Promise<any>>;
      update: jest.Mock<(args: any) => Promise<any>>;
    };
  };
  let jwt: { signAsync: jest.Mock<(payload: any) => Promise<string>> };

  const registerDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
  };

  beforeEach(async () => {
    userService = { findOne: jest.fn() };
    prisma = {
      user: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    jwt = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServiceClass,
        { provide: UserService, useValue: userService },
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthServiceClass);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      userService.findOne.mockResolvedValue({
        id: 1,
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should create a new user with hashed password', async () => {
      userService.findOne.mockResolvedValue(null);
      mockHash.mockResolvedValue('hashed_password');
      const created = {
        id: 1,
        name: registerDto.name,
        email: registerDto.email,
        created_at: new Date(),
      };
      prisma.user.create.mockResolvedValue(created);

      const result = await service.register(registerDto);

      expect(mockHash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { ...registerDto, password: 'hashed_password' },
        select: { id: true, name: true, email: true, created_at: true },
      });
      expect(result).toEqual(created);
    });
  });

  describe('login', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      userService.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      userService.findOne.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: 'hashed',
      });
      mockCompare.mockResolvedValue(false);

      await expect(
        service.login({ email: registerDto.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and email on success', async () => {
      userService.findOne.mockResolvedValue({
        id: 1,
        email: registerDto.email,
        password: 'hashed',
      });
      mockCompare.mockResolvedValue(true);
      jwt.signAsync.mockResolvedValue('mock-token');

      const result = await service.login({
        email: registerDto.email,
        password: registerDto.password,
      });

      expect(mockCompare).toHaveBeenCalledWith(registerDto.password, 'hashed');
      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: registerDto.email,
      });
      expect(result).toEqual({
        accessToken: 'mock-token',
        email: registerDto.email,
      });
    });
  });

  describe('logout', () => {
    it('should deactivate the user', async () => {
      const updated = {
        name: 'John Doe',
        email: registerDto.email,
        is_active: false,
      };
      prisma.user.update.mockResolvedValue(updated);

      const result = await service.logout(1);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { is_active: false },
        select: { name: true, email: true, is_active: true },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password with the given salt', async () => {
      mockHash.mockResolvedValue('hashed');

      await expect(service.hashPassword('plain', 10)).resolves.toBe('hashed');
      expect(mockHash).toHaveBeenCalledWith('plain', 10);
    });
  });

  describe('generateAccessToken', () => {
    it('should sign a JWT with sub and email payload', async () => {
      jwt.signAsync.mockResolvedValue('token');

      await expect(service.generateAccessToken(5, 'a@b.com')).resolves.toBe(
        'token',
      );
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 5, email: 'a@b.com' });
    });
  });
});
