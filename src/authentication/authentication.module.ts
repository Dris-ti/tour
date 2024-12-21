import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { DatabaseModule } from 'src/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationController } from './authentication.controller';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO } from '../database/database.entity';
import { EmailService } from 'src/email/email.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';

@Module({
   imports: [DatabaseModule, 
      TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO, AGENCY_INFO, BOOKING_INFO, PACKAGE_INFO, TRANSPORT_INFO, DESTINATION_INFO, REVIEW_INFO, PAYMENT_INFO]),
      ActivityLogModule],
    controllers: [AuthenticationController],
  providers: [AuthenticationService, EmailService]
})
export class AuthenticationModule {}
