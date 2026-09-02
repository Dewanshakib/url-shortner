import { IsString, IsUrl } from "class-validator"

export class GenerateUrlDto {
    @IsUrl()
    readonly url: string;
}