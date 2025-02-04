
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import {Request} from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
//v1.4.4-Inject JWT service here
constructor(private jwtService:JwtService,
  @InjectRepository
              (LOGIN_INFO)
          private login_info_Repository: Repository<LOGIN_INFO>
){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const request = context.switchToHttp().getRequest();
    const token = extractFromHeader(request);
    console.log("Token: " + token);
    if(!token){
        // return false; //this will return Forbidden 403 error. so better to avoid this.
        throw new UnauthorizedException("Invalid Null Token.");
    }
    //So the token is not empty so validation required!
    try{
        const payload = this.jwtService.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET as string }); // Throw error in case of expired token or unavailable Token
        request.userEmail = payload.email;
        console.log("Paylod: " + request.userEmail);

    }catch(error){
      console.log("Paylod Error: " + error);
        Logger.error(error.message); //console logging the error 
        throw new UnauthorizedException("Invalid Entry of Token.")
    }
    return true;
  }
}

function extractFromHeader(request: Request): string | undefined {
  // console.log("Incoming Headers:", request.headers);
  console.log("Incoming Cookies:", request.cookies);

  const authHeader = request.headers.authorization?.split(' ')[1];
  const cookieToken = request.cookies?.accessToken;

  console.log("Extracted AuthHeader: " + authHeader);
  console.log("Extracted CookieToken: " + cookieToken);

  return authHeader || cookieToken;
}

