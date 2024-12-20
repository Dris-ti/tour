import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }

    @Patch("/editAdminProfile")
    editAdminProfile(@Body() data, @Req() req, @Res() res) {
        return this.AdminService.editAdminProfile(data, req, res);
    }   

    @Get("/showTourGuides")
    showTourGuides(@Req() req, @Res() res) {
        return this.AdminService.showTourGuides(req, res);
    }

    @Get("/showTourAgencies")
    showTourAgencies(@Req() req, @Res() res) {
        return this.AdminService.showTourAgencies(req, res);
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
    addAdmin(@Body() data, @Req() req, @Res() res)
    {
        return this.AdminService.addAdmin(data, req, res);
    }

    
    
}
