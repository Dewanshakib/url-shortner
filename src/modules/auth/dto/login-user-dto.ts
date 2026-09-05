import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'The email address of the registered user',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'strong-password-123',
    description: 'The password associated with the email',
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
