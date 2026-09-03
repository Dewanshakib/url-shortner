import { Reflector } from '@nestjs/core';

export const SkipResponse = Reflector.createDecorator<boolean>();