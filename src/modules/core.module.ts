import { Module } from '@nestjs/common';
import { UrlsModule } from './urls/urls.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/users.module.js';

@Module({
  imports: [UrlsModule, AuthModule, UserModule],
  exports: [UrlsModule],
})
export class CoreModule {}
