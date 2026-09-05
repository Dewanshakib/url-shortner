import { IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateUrlDto {
  @ApiProperty({
    example: 'https://www.google.com',
    description: 'The long URL to be shortened',
  })
  @IsUrl()
  readonly url: string;
}
