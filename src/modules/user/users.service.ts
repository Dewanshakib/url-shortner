import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    // if (!user) {
    //   throw new NotFoundException('No user found with this email address.');
    // }

    return user;
  }
}
