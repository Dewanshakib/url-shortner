import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  readonly name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'A valid email address for the user',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'strong-password-123',
    description: 'The user password (will be hashed before storage)',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
