import { jest } from '@jest/globals';
import { of, lastValueFrom } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor.js';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let reflector: { get: jest.Mock<(...args: any[]) => any> };

  const createMockContext = (statusCode = 200) => {
    const response = { statusCode };
    return {
      switchToHttp: () => ({ getResponse: () => response }),
      getHandler: () => () => {},
    } as any;
  };

  const createMockHandler = (value: any) => ({
    handle: () => of(value),
  });

  beforeEach(() => {
    reflector = { get: jest.fn() };
    interceptor = new ResponseInterceptor(reflector as any);
  });

  it('should pass through when @SkipResponse is applied', async () => {
    reflector.get.mockReturnValue(true);
    const context = createMockContext();
    const data = { url: 'http://example.com' };

    const result$ = interceptor.intercept(context, createMockHandler(data));
    await expect(lastValueFrom(result$)).resolves.toEqual(data);
  });

  it('should wrap the response with success envelope', async () => {
    reflector.get.mockReturnValue(false);
    const context = createMockContext(201);
    const data = { id: 1, name: 'Test' };

    const result$ = interceptor.intercept(context, createMockHandler(data));
    await expect(lastValueFrom(result$)).resolves.toEqual({
      success: true,
      statusCode: 201,
      message: 'Request successful',
      data,
    });
  });

  it('should wrap null data correctly', async () => {
    reflector.get.mockReturnValue(false);
    const context = createMockContext(200);

    const result$ = interceptor.intercept(context, createMockHandler(null));
    await expect(lastValueFrom(result$)).resolves.toEqual({
      success: true,
      statusCode: 200,
      message: 'Request successful',
      data: null,
    });
  });
});
