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
import { AdminProfileTasksController } from './admin-profile-tasks/admin-profile-tasks.controller';
import { AdminProfileTasksService } from './admin-profile-tasks/admin-profile-tasks.service';
import { AdminProfileTasksModule } from './admin-profile-tasks/admin-profile-tasks.module';
import { ActivityLogService } from './activity-log/activity-log.service';
import { AdminService } from './admin-tasks/admin-tasks.service';

@Module({
  imports: [AdminModule, DatabaseModule, EmailModule, AuthenticationModule, AdminDashboardModule, ActivityLogModule, AdminProfileTasksModule],
  controllers: [AppController],
  providers: [AppService, AdminDashboardService, AuthenticationService, EmailService, AdminProfileTasksService, ActivityLogService, AdminService],
})
export class AppModule {}
