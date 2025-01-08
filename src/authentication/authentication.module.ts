import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationController } from './authentication.controller';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { USER_INFO } from 'src/database/entities/user_info.entity';
import { EmailService } from 'src/email/email.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { JwtService } from '@nestjs/jwt';

@Module({
   imports: [DatabaseModule, 
      TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO]),
      ActivityLogModule],
    controllers: [AuthenticationController],
  providers: [AuthenticationService, EmailService, ActivityLogService, JwtService]
})
export class AuthenticationModule {}
