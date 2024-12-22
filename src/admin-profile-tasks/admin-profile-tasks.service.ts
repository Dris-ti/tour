import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ACTIVITY_LOG_INFO, USER_INFO } from 'src/database/database.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminProfileTasksService {
    constructor(
        @InjectRepository
            (ACTIVITY_LOG_INFO)
        private activity_log_info_Repository: Repository<ACTIVITY_LOG_INFO>,

        @InjectRepository
            (USER_INFO)
        private user_info_Repository: Repository<USER_INFO>,

        private authService: AuthenticationService
    ) { }

    async getProfileActivityLog(req, res) {
        const user = await this.authService.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const logs = await this.activity_log_info_Repository.find({
            where: { user_id: user.id }
        });

        return res.json(logs);
    }
}
