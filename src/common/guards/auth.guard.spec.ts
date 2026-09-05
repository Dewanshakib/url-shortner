import { jest } from '@jest/globals';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verifyAsync: jest.Mock<(token: string) => Promise<any>> };
  let reflector: {
    getAllAndOverride: jest.Mock<(...args: any[]) => boolean | undefined>;
  };

  const createMockContext = (
    headers: Record<string, string> = {},
    handler = () => {},
    classType = class {},
  ): ExecutionContext => {
    const request: Record<string, unknown> & {
      headers: Record<string, string>;
    } = { headers };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => classType,
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({}) as never,
      switchToWs: () => ({}) as never,
      getType: () => 'http' as const,
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    reflector = { getAllAndOverride: jest.fn() };

    guard = new AuthGuard(jwtService as any, reflector as any);
  });

  it('should allow access for public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext();

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when no token is provided', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for non-Bearer auth', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      authorization: 'Basic dXNlcjpwYXNz',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when JWT verification fails', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
    const context = createMockContext({
      authorization: 'Bearer bad-token',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach payload to request and allow access on valid token', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const payload = { sub: 1, email: 'user@example.com' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const request: Record<string, unknown> = {
      headers: { authorization: 'Bearer good-token' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => () => {},
      getClass: () => class {},
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({}) as never,
      switchToWs: () => ({}) as never,
      getType: () => 'http' as const,
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('good-token');
    expect(request.user).toEqual(payload);
  });
});
