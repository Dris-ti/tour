import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationController } from './authentication.controller';
import { LOGIN_INFO, USER_INFO } from '../database/database.entity';
import { EmailService } from 'src/email/email.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Module({
   imports: [DatabaseModule, 
      TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO]),
      ActivityLogModule],
    controllers: [AuthenticationController],
  providers: [AuthenticationService, EmailService, ActivityLogService]
})
export class AuthenticationModule {}
