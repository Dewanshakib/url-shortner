import { IsString, MaxLength, MinLength } from 'class-validator';

export class RedirectUrlDto {
  @IsString()
  @MaxLength(8)
  @MinLength(8)
  readonly shortId: string;
}
