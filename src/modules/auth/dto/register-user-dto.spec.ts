import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterUserDto } from './register-user-dto.js';

describe('RegisterUserDto', () => {
  const validDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
  };

  it('should accept valid input', async () => {
    const dto = plainToInstance(RegisterUserDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject a missing name', async () => {
    const dto = plainToInstance(RegisterUserDto, { ...validDto, name: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      ...validDto,
      email: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should reject a missing password', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      ...validDto,
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should strip unknown properties (whitelist)', async () => {
    const dto = plainToInstance(RegisterUserDto, {
      ...validDto,
      role: 'admin',
    }) as Record<string, unknown>;
    const errors = await validate(dto, { whitelist: true });
    expect(errors).toHaveLength(0);
    expect(dto.role).toBeUndefined();
  });
});
