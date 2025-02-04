import { Module } from '@nestjs/common';
import { AdminController } from './admin-tasks.controller';
import { AdminService } from '../admin-tasks/admin-tasks.service';
import { EmailService } from '../email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { USER_INFO } from 'src/database/entities/user_info.entity';
import { AGENCY_INFO } from 'src/database/entities/agency_info.entity';
import { PAYMENT_INFO } from 'src/database/entities/payment_info.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, 
    TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO, AGENCY_INFO, PAYMENT_INFO]),
    ActivityLogModule],
    
  controllers: [AdminController],
  providers: [AdminService, EmailService, AuthenticationService, ActivityLogService, JwtService]
})
export class AdminModule {}
