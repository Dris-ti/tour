import { Module } from '@nestjs/common';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACTIVITY_LOG_INFO } from 'src/database/entities/activity_log_info.entity';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([ACTIVITY_LOG_INFO])],
  controllers: [ActivityLogController],
  providers: [ActivityLogService]
})
export class ActivityLogModule {}
