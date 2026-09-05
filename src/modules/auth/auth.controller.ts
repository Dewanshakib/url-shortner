import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user-dto.js';
import { AuthService } from './auth.service.js';
import { LoginUserDto } from './dto/login-user-dto.js';
import { Public } from '../../common/decorator/public.decorator.js';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ AUTH: {  } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterUserDto })
  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
  })
  @ApiConflictResponse({
    description: 'A user with this email already exists.',
  })
  async register(@Body() RegisterUserDto: RegisterUserDto) {
    return this.authService.register(RegisterUserDto);
  }

  @Public()
  @Post('login')
  @Throttle({ AUTH: {  } })
  @ApiOperation({
    summary: 'Authenticate a user and obtain a JWT access token',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiOkResponse({ description: 'Access token issued successfully.' })
  @ApiNotFoundResponse({ description: 'No user found with this email.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(@Body() LoginUserDto: LoginUserDto) {
    return this.authService.login(LoginUserDto);
  }

  @Get('profile')
  @Throttle({ PROFILE: { } })
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the profile of the authenticated user' })
  @ApiOkResponse({ description: 'The authenticated user profile.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async profile(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @Throttle({ LOGOUT: { } })
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Log the user out (deactivate session)' })
  @ApiOkResponse({ description: 'User has been logged out.' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  async logout(@Request() request: any) {
    const userId = request.user.sub;
    return this.authService.logout(+userId);
  }
}
