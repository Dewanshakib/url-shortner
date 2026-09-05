import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateUrlDto } from './generate-url-dto.js';

describe('GenerateUrlDto', () => {
  it('should accept a valid URL', async () => {
    const dto = plainToInstance(GenerateUrlDto, {
      url: 'https://example.com/path?query=1',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid URL', async () => {
    const dto = plainToInstance(GenerateUrlDto, {
      url: 'not-a-url',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isUrl');
  });

  it('should reject a missing url', async () => {
    const dto = plainToInstance(GenerateUrlDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
