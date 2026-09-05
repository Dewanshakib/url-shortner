import { Reflector } from '@nestjs/core';
import { SkipResponse } from './skip-response.decorator.js';

describe('SkipResponse Decorator', () => {
  it('should be a function', () => {
    expect(typeof SkipResponse).toBe('function');
  });

  it('should set truthy metadata when applied to a handler', () => {
    class TestController {
      @SkipResponse()
      handler() {}
    }

    const instance = new TestController();
    const reflector = new Reflector();

    const meta = reflector.getAllAndOverride(SkipResponse, [
      instance.handler,
      TestController,
    ]);
    expect(meta).toBeTruthy();
  });
});
