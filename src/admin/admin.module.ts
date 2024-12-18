import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { EmailService } from './admin.EmailService';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO } from './DB.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'ADMIN_BACKEND',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    }), 
    TypeOrmModule.forFeature([LOGIN_INFO, USER_INFO, AGENCY_INFO, BOOKING_INFO, PACKAGE_INFO, TRANSPORT_INFO, DESTINATION_INFO, REVIEW_INFO, PAYMENT_INFO]),],
    
  controllers: [AdminController],
  providers: [AdminService, EmailService]
})
export class AdminModule {}
