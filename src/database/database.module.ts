import { Module } from '@nestjs/common';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO  } from './database.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          LOGIN_INFO,
          AGENCY_INFO,
          BOOKING_INFO,
          PACKAGE_INFO,
          TRANSPORT_INFO,
          DESTINATION_INFO,
          USER_INFO, // DB required for the Tour Guide Admin dashboard
          REVIEW_INFO,
          PAYMENT_INFO
        ]), //npm add @nestjs/typeorm typeorm pg
        TypeOrmModule.forRoot(
          // Connecting POSTGRE SQL to NESTJS
          {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'postgres',
            password: 'root',
            database: 'ADMIN_BACKEND',
            entities: [__dirname + '/../database/entities/*.entity.{js,ts}'],
            autoLoadEntities: true, // Enable automatic entity loading
            synchronize: true,
          },
        ),
      ],
      exports: [TypeOrmModule], //v1.4.2- Exporting the TypeOrmModule to other modules so other modules can now use this
      controllers: [],
      providers: [],
})
export class DatabaseModule {}
