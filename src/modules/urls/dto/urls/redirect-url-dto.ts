import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RedirectUrlDto {
  @ApiProperty({
    example: 'aB3xK9mZ',
    description: 'The 8-character short identifier to redirect',
  })
  @IsString()
  @MaxLength(8)
  @MinLength(8)
  readonly shortId: string;
}
