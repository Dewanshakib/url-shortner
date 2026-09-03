import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user-dto.js';
import { LoginUserDto } from './dto/login-user-dto.js';
import { UserService } from '../user/users.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwt:JwtService
  ) {}

  async register(RegisterUserDto: RegisterUserDto) {
    const user = await this.userService.findOne(RegisterUserDto.email);

    if (user) {
      throw new ConflictException(
        'User is already registerd with this email address',
      );
    }

    // hass password
    const hashedPassword = await this.hashPassword(
      RegisterUserDto.password,
      10,
    );

    const newUser = await this.prisma.user.create({
      data: {
        ...RegisterUserDto,
        password: hashedPassword,
      },
      select:{
        id:true,
        name:true,
        email:true,
        created_at:true
      }
    });

    return newUser;
  }

  async login(LoginUserDto: LoginUserDto) {
    const found = await this.userService.findOne(LoginUserDto.email);

    if(!found){
      throw new NotFoundException("User is not registerd with this email address");
    }

    // match credentials
    const isMatched = await bcrypt.compare(LoginUserDto.password,found.password);
    if (!isMatched){
        throw new UnauthorizedException();
    }


    // generate jwt access token
    const accessToken = await this.generateAccessToken(found.id,found.email);

    const response = {accessToken,email:found.email};

    return response;
  }

  async hashPassword(password: string, salt: number) {
    return await bcrypt.hash(password, salt);
  }

  async generateAccessToken (userId:number,email:string){
    const payload = {sub:userId,email}
    return await this.jwt.signAsync(payload)
  }
}
