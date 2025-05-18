import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { USER_INFO  } from 'src/database/entities/user_info.entity';
import { ACTIVITY_LOG_INFO } from 'src/database/entities/activity_log_info.entity';
import { AGENCY_INFO } from './entities/agency_info.entity';
import { BOOKING_INFO } from './entities/booking_info.entity';
import { PACKAGE_INFO } from './entities/package_info.entity';
import { TRANSPORT_INFO } from './entities/transport_info.entity';
import { DESTINATION_INFO } from './entities/destination_info.entity';
import { REVIEW_INFO } from './entities/review_info.entity';
import { PAYMENT_INFO } from './entities/payment_info.entity';
require('dotenv').config();



@Module({
    imports: [
        TypeOrmModule.forFeature([
          LOGIN_INFO,
          AGENCY_INFO,
          BOOKING_INFO,
          PACKAGE_INFO,
          TRANSPORT_INFO,
          DESTINATION_INFO,
          USER_INFO, 
          REVIEW_INFO,
          PAYMENT_INFO,
          ACTIVITY_LOG_INFO
        ]), 
        TypeOrmModule.forRoot(
          // Connecting POSTGRE SQL to NESTJS
          {
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            entities: [__dirname + '/../database/entities/*.entity.{js,ts}'],
            autoLoadEntities: true, // Enable automatic entity loading
            synchronize: true,
            logging:false,
            
          },
        ),
      ],
      exports: [TypeOrmModule], //v1.4.2- Exporting the TypeOrmModule to other modules so other modules can now use this
      controllers: [],
      providers: [],
})
export class DatabaseModule {}
