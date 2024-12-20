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

@Module({
  imports: [AdminModule, DatabaseModule, EmailModule, AuthenticationModule, AdminDashboardModule],
  controllers: [AppController, AuthenticationController],
  providers: [AppService, AdminDashboardService, AuthenticationService, EmailService],
})
export class AppModule {}
