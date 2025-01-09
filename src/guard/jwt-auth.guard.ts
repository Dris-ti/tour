
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
    if(!token){
        // return false; //this will return Forbidden 403 error. so better to avoid this.
        throw new UnauthorizedException("Invalid Null Token.");
    }
    //So the token is not empty so validation required!
    try{
        const payload = this.jwtService.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET as string }); // Throw error in case of expired token or unavailable Token
        // request.userID = payload.userID; //This will allow us to fetch the user id for valid tokens. So for valid users, we get user id and perform operations directly
        const userEmail = payload.email;
        request.userEmail = userEmail;

    }catch(error){
        Logger.error(error.message); //console logging the error 
        throw new UnauthorizedException("Invalid Entry of Token.")
    }
    return true;
  }
}

function extractFromHeader(request: Request): string | undefined {
  // Check token in Authorization header
  const authHeader = request.headers.authorization?.split(' ')[1];
   
  // Check token in cookies
  const cookieToken = request.cookies?.accessToken;

  return authHeader || cookieToken;
}
