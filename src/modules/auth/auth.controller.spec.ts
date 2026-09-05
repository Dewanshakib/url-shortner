import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock<(dto: any) => Promise<any>>;
    login: jest.Mock<(dto: any) => Promise<any>>;
    logout: jest.Mock<(userId: number) => Promise<any>>;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should delegate to authService.register', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
      };
      const created = { id: 1, name: dto.name, email: dto.email };
      authService.register.mockResolvedValue(created);

      await expect(controller.register(dto)).resolves.toEqual(created);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should delegate to authService.login', async () => {
      const dto = { email: 'john@example.com', password: 'secret123' };
      const response = { accessToken: 'token', email: dto.email };
      authService.login.mockResolvedValue(response);

      await expect(controller.login(dto)).resolves.toEqual(response);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('profile', () => {
    it('should return the user payload from the request', async () => {
      const user = { sub: 1, email: 'john@example.com' };
      const req = { user };

      await expect(controller.profile(req)).resolves.toEqual(user);
    });
  });

  describe('logout', () => {
    it('should delegate to authService.logout with numeric user id', async () => {
      const req = { user: { sub: '3' } };
      const response = {
        name: 'John Doe',
        email: 'john@example.com',
        is_active: false,
      };
      authService.logout.mockResolvedValue(response);

      await expect(controller.logout(req)).resolves.toEqual(response);
      expect(authService.logout).toHaveBeenCalledWith(3);
    });
  });
});
