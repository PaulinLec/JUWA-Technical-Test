import { Module } from '@nestjs/common';
import { ProfilesModule } from './profiles/profiles.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ProfilesModule, AuthModule],
})
export class AppModule {}
