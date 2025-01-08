import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ACTIVITY_LOG_INFO } from 'src/database/entities/activity_log_info.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ACTIVITY_LOG_INFO)
        private readonly activityLogRepository: Repository<ACTIVITY_LOG_INFO>, // Inject repository for ACTIVITY_LOG_INFO
      ) {}


      async addLog(log) {
        const newLog = this.activityLogRepository.create(log);
        // console.log(log); // For debugging purposes
        await this.activityLogRepository.save(newLog);
      }
}
