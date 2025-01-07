import { IsEmail, IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class addAdminDto {
    @IsEmail()
    @IsString()
    email: string;
}
