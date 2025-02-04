import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthGuard } from 'src/guard/jwt-auth.guard';

@UseGuards(AuthGuard)
@Controller('admin-dashboard')
export class AdminDashboardController {
    constructor(private readonly adminDashboardService: AdminDashboardService) { }

    @Get("/monthlyTransaction")
    monthlyTransaction(@Body() data, @Req() req, @Res() res)
    {
        return this.adminDashboardService.monthlyTransaction(data, req, res);
    }

    @Get("/yearlyTransaction")
    yearlyTransaction(@Body() data, @Req() req, @Res() res)
    {
        return this.adminDashboardService.yearlyTransaction(data, req, res);
    }

    @Get("/userCount")
    userCount(@Req() req, @Res() res)
    {
        return this.adminDashboardService.userCount(req, res);
    }

    @Get("/profit")
    profit(@Req() req, @Res() res)
    {
        return this.adminDashboardService.profit(req, res);
    }

    @Get("/allYearlyTransaction")
    allYearlyTransaction(@Req() req, @Res() res)
    {
        return this.adminDashboardService.allYearlyTransaction(req, res);
    }

    @Get("/allMonthlyTransactionByYear/:year")
    allMonthlyTransactionByYear(@Param('year') year, @Req() req, @Res() res)
    {
        return this.adminDashboardService.allMonthlyTransactionByYear(year, req, res);
    }
}
