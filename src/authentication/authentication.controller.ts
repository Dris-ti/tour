import { Controller, Post, Body, Get, Res, Req, Patch, Param, Delete, UseGuards, UnauthorizedException } from '@nestjs/common';
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

    
    @Post("/requestChangePassword/:email")
    requestChangePassword(@Param('email') email, @Req() req, @Res() res) {
        return this.AuthenticationService.requestChangePassword(email, req, res);
    }

    // @UseGuards(AuthGuard)
    @Post("/forgetPassword")
    forgetPassword(@Body() data : ForgetPasswordDto, @Res() res) {
        return this.AuthenticationService.forgetPassword(data, res);
    }


    @UseGuards(AuthGuard)
    @Get('/verifyToken')
     // Protect this route
    verifyToken(@Req() req, @Res() res) {
        try {
            const userEmail = req.userEmail; // Extracted from AuthGuard
            return res.status(200).json({ authenticated: true, userEmail });
        } catch (error) {
            throw new UnauthorizedException('Invalid Token');
        }
    }

    @Get('/GetAccountInfo')
    getAccountInfo(@Body("email") email, @Req() req, @Res() res)
    {
        this.AuthenticationService.getAccountInfo(email, req, res);
    }

}
