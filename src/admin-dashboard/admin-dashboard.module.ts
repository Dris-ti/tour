import { Module } from '@nestjs/common';
import { AdminDashboardController } from './admin-dashboard.controller';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACTIVITY_LOG_INFO, AGENCY_INFO, PAYMENT_INFO, USER_INFO } from '../database/database.entity';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { EmailService } from 'src/email/email.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';


@Module({
  imports: [DatabaseModule, 
      TypeOrmModule.forFeature([USER_INFO, AGENCY_INFO,PAYMENT_INFO, ACTIVITY_LOG_INFO]),
    ActivityLogModule],
      providers: [AdminDashboardService, AuthenticationService, EmailService, ActivityLogService],
  controllers: [AdminDashboardController]
})
export class AdminDashboardModule {}
