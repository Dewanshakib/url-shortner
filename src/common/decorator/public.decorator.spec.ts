import 'reflect-metadata';
import { IS_PUBLIC_KEY, Public } from './public.decorator.js';

describe('Public Decorator', () => {
  it('should export IS_PUBLIC_KEY with the correct value', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should set isPublic metadata to true on a handler', () => {
    class TestController {
      @Public()
      handler() {}
    }

    // Extract handler to avoid unbound-method warnings (suppressed for spec files)
    const handler = TestController.prototype.handler;
    const meta = Reflect.getMetadata(IS_PUBLIC_KEY, handler);
    expect(meta).toBe(true);
  });
});
