import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RedirectUrlDto } from './redirect-url-dto.js';

describe('RedirectUrlDto', () => {
  it('should accept an 8-character string', async () => {
    const dto = plainToInstance(RedirectUrlDto, { shortId: 'abcd1234' });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject a shortId shorter than 8 characters', async () => {
    const dto = plainToInstance(RedirectUrlDto, { shortId: 'abc' });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should reject a shortId longer than 8 characters', async () => {
    const dto = plainToInstance(RedirectUrlDto, { shortId: 'abcdefghij' });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should reject a non-string shortId', async () => {
    const dto = plainToInstance(RedirectUrlDto, { shortId: 12345678 });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
