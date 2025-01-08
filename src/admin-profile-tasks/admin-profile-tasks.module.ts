import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { AdminProfileTasksService } from './admin-profile-tasks.service';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { AdminProfileTasksController } from './admin-profile-tasks.controller';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { AuthenticationController } from 'src/authentication/authentication.controller';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { EmailService } from 'src/email/email.service';
import { USER_INFO } from 'src/database/entities/user_info.entity';
import { ACTIVITY_LOG_INFO } from 'src/database/entities/activity_log_info.entity';

@Module({
    imports: [DatabaseModule, 
        TypeOrmModule.forFeature([USER_INFO, ACTIVITY_LOG_INFO]),
        ActivityLogModule],
        
      controllers: [AdminProfileTasksController],
      providers: [AdminProfileTasksService, AuthenticationService, ActivityLogService, EmailService]
})
export class AdminProfileTasksModule {}
