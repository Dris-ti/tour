import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin-tasks/admin-tasks.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationModule } from './authentication/authentication.module';
import { AdminDashboardService } from './admin-dashboard/admin-dashboard.service';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { AuthenticationService } from './authentication/authentication.service';
import { EmailService } from './email/email.service';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { ActivityLogService } from './activity-log/activity-log.service';
import { AdminService } from './admin-tasks/admin-tasks.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [AdminModule, DatabaseModule, EmailModule, AuthenticationModule, AdminDashboardModule, ActivityLogModule],
  controllers: [AppController],
  providers: [AppService, AdminDashboardService, AuthenticationService, EmailService, ActivityLogService, AdminService, JwtService],
})
export class AppModule {}
