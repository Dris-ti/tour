import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { ForgetPasswordDto } from './dtos/forgetPassword.dto';
import { AuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly AuthenticationService: AuthenticationService) { }
    @Get("/passwordHasing")
        passwordHasing(@Body() data) {
            return this.AuthenticationService.passwordHasing(data);
        }
    
        @Post("/login")
        login(@Body() data : LoginDto, @Req() req, @Res() res) {
            return this.AuthenticationService.login(data, req, res);
        }
        
        @UseGuards(AuthGuard)
        @Post("/logout")
        logout(@Req() req, @Res() res) {
            return this.AuthenticationService.logout(req, res);
        }

        @UseGuards(AuthGuard)
        @Post("/changePassword")
    changePassword(@Body() data : ChangePasswordDto, @Req() req, @Res() res) {
        return this.AuthenticationService.changePassword(data, req, res);
    }

    @UseGuards(AuthGuard)
    @Post("/requestChangePassword")
    requestChangePassword(@Req() req, @Res() res) {
        return this.AuthenticationService.requestChangePassword(req, res);
    }

    @UseGuards(AuthGuard)
    @Post("/forgetPassword")
    forgetPassword(@Body() data : ForgetPasswordDto) {
        return this.AuthenticationService.forgetPassword(data);
    }
}
