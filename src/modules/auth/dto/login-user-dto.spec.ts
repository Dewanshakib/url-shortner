import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto } from './login-user-dto.js';

describe('LoginUserDto', () => {
  const validDto = {
    email: 'john@example.com',
    password: 'secret123',
  };

  it('should accept valid input', async () => {
    const dto = plainToInstance(LoginUserDto, validDto);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(LoginUserDto, {
      ...validDto,
      email: 'bad-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should reject a missing email', async () => {
    const dto = plainToInstance(LoginUserDto, { password: 'secret123' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject a missing password', async () => {
    const dto = plainToInstance(LoginUserDto, {
      email: 'john@example.com',
      password: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
