import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email:string;


    @IsString()
    @IsNotEmpty()
    readonly password:string;
}