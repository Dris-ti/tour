import { Controller, Get, Req, Res } from '@nestjs/common';
import { AdminProfileTasksService } from './admin-profile-tasks.service';

@Controller('admin-profile-tasks')
export class AdminProfileTasksController {
    constructor(private readonly adminProfileTasksService: AdminProfileTasksService) { }

    @Get("/getProfileActivityLog")
    getProfileActivityLog(@Req() req, @Res() res)
    {
        return this.adminProfileTasksService.getProfileActivityLog(req, res);
    }
}
