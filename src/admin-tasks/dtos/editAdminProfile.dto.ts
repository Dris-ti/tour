import { IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class editAdminProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone_no?: string;

    @IsOptional()
    @IsISO8601()
    dob?: Date;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    nid_no?: string;

    @IsOptional()
    @IsString()
    nid_pic_path?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    user_type?: string;

    @IsOptional()
    @IsString()
    profile_pic_path?: string;

    @IsOptional()
    @IsString()
    addresss?: string;
}
