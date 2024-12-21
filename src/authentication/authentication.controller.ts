import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly AuthenticationService: AuthenticationService) { }
    @Get("/passwordHasing")
        passwordHasing(@Body() data) {
            return this.AuthenticationService.passwordHasing(data);
        }
    
        @Post("/login")
        login(@Body() data, @Req() req, @Res() res) {
            return this.AuthenticationService.login(data, req, res);
        }
    
        @Post("/logout")
        logout(@Req() req, @Res() res) {
            return this.AuthenticationService.logout(req, res);
        }

        @Post("/changePassword")
    changePassword(@Body() data, @Req() req, @Res() res) {
        return this.AuthenticationService.changePassword(data, req, res);
    }

    @Post("/requestChangePassword")
    requestChangePassword(@Req() req, @Res() res) {
        return this.AuthenticationService.requestChangePassword(req, res);
    }

    @Post("/forgetPassword")
    forgetPassword(@Body() data) {
        return this.AuthenticationService.forgetPassword(data);
    }
}
