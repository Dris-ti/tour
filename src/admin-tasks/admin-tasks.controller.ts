import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from '../admin-tasks/admin-tasks.service';
import { editAdminProfileDto } from './dtos/editAdminProfile.dto';
import { addAdminDto } from './dtos/addAdmin.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }

    @Patch("/editAdminProfile")
    editAdminProfile(@Body() data : editAdminProfileDto, @Req() req, @Res() res) {
        return this.AdminService.editAdminProfile(data, req, res);
    }   

    @Get("/showTourGuides/:status")
    showTourGuides(@Req() req, @Res() res, @Param('status') status) {
        return this.AdminService.showTourGuides(req, res, status);
    }

    @Get("/showAdmins")
    showAdmins(@Req() req, @Res() res,) {
        return this.AdminService.showAdmins(req, res);
    }

    @Get("/showTourAgencies/:status")
    showTourAgencies(@Req() req, @Res() res, @Param('status') status) {
        return this.AdminService.showTourAgencies(req, res, status);
    }

    @Get("/showAgencyInfoById/:id")
    showAgencyInfoById(@Req() req, @Res() res, @Param("id") id) {
        return this.AdminService.showAgencyInfoById(req, res, id);
    }

    @Get("/showGuideInfoById/:id")
    showGuideInfoById(@Req() req, @Res() res, @Param("id") id) {
        return this.AdminService.showGuideInfoById(req, res, id);
    }

    @Delete("/removeTourGuide/:id")
    removeTourGuide(@Req() req, @Res() res, @Param("id") id) {
        return this.AdminService.removeTourGuide(req, res, id);
    }

    @Delete("/removeTourAgency/:id")
    removeTourAgency(@Req() req, @Res() res, @Param("id") id) {
        return this.AdminService.removeTourAgency(req, res, id);
    }

    @Patch("/acceptTourGuide/:id")
    acceptTourGuide(@Param('id') id, @Req() req, @Res() res) {
        return this.AdminService.acceptTourGuide(id, req, res);
    }

    @Patch("/acceptTourAgency/:id")
    acceptTourAgency(@Param('id') id, @Req() req, @Res() res) {
        return this.AdminService.acceptTourAgency(id, req, res);
    }

    // -----------------------------------------------------------
    @Post('/registerTourAgency')
    async registerTourAgency(@Body() data) {
        return this.AdminService.registerTourAgency(data);
    }
    
    @Post('/registerTourGuide')
    async registerTourGuide(@Body() data) {
        return this.AdminService.registerTourGuide(data);
    }

    @Post('/addPaymentDetails')
    async addPaymentDetails(@Body() data)
    {
        return this.AdminService.addPaymentDetails(data);
    }
    // ----------------------------------------------------------

    @Post("/addAdmin")
    addAdmin(@Body() data : addAdminDto, @Req() req, @Res() res)
    {
        return this.AdminService.addAdmin(data, req, res);
    }
    
    @Get("/getProfileActivityLog")
    getProfileActivityLog(@Req() req, @Res() res)
    {
        return this.AdminService.getProfileActivityLog(req, res);
    }

    @Get("/showAdminProfile")
        showAdminProfile(@Req() req, @Res() res)
        {
            return this.AdminService.showAdminProfile(req, res);
        }
}
