import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user-dto.js';
import { AuthService } from './auth.service.js';
import { LoginUserDto } from './dto/login-user-dto.js';
import { Public } from '../../common/decorator/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.register(RegisterUserDto);
  }

  @Public()
  @Post('login')
  async login(@Body() LoginUserDto: LoginUserDto) {
    return this.authService.login(LoginUserDto);
  }

  // @UseGuards(AuthGuard)
  @Get("profile")
  async profile (@Request() req:any){
    return req.user;
  }
}
