import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator"

export class RegisterUserDto {
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    readonly name:string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    readonly email:string;


    @IsString()
    @IsNotEmpty()
    readonly password:string;
}