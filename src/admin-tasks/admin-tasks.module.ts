import { Module } from '@nestjs/common';
import { AdminController } from './admin-tasks.controller';
import { AdminService } from '../admin-tasks/admin-tasks.service';
import { EmailService } from '../email/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO } from '../database/database.entity';
import { DatabaseModule } from 'src/database/database.module';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
  imports: [DatabaseModule, 
    TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO, AGENCY_INFO, BOOKING_INFO, PACKAGE_INFO, TRANSPORT_INFO, DESTINATION_INFO, REVIEW_INFO, PAYMENT_INFO]),
    ActivityLogModule],
    
  controllers: [AdminController],
  providers: [AdminService, EmailService, AuthenticationService]
})
export class AdminModule {}
