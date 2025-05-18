import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { error } from 'console';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository
            (LOGIN_INFO)
        private login_info_Repository: Repository<LOGIN_INFO>,

        private readonly EmailService: EmailService,
        private readonly activityLog: ActivityLogService
    ) { }

    async passwordHasing(data) {
        //  let password = data['password']; // for generating password manually 
        let password = data; 
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    generateAccessToken(user) {
        return jwt.sign(
            // Payload
            {
                id: user.id,
                email: user.email,
            },
            // Access Token Secret
            process.env.ACCESS_TOKEN_SECRET,
            // Expiry
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY
            }
        )
    }

    async login(data, req, res) {
        const {email, password } = data

        // Find user
        const user = await this.login_info_Repository.findOne(
            {
                where: { email: email }, // Ensure the user relation is fetched
                relations: ['user_id'],
            }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                secure: true, // true for HTTPS
                sameSite: 'none', // this is a must for cross-origin cookies
                error: {
                    message: "The email or password you entered is incorrect.",
                },
            }); 
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user['password']);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: {
                    message: "The email or password you entered is incorrect.",
                },
            });
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);

        // Cannot modify cookies from the client site
        const options = {
            httpOnly: true,
            secure: false
        }

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });
  
        // send access token and refresh token to the user using cookie
        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .header('Authorization', `Bearer ${accessToken}`)
            .json(
                {
                    message: "Login Successful"
                }
            )

    }


    async verifyUser(email) {
        
      const userEmail = email;

            // find the user
            const user = await this.login_info_Repository.findOne({
                where: { email: userEmail},
                relations: ["user_id"]
            });

            // check if the user has valid refresh token
            if (!user || user.user_id.user_type != "Admin") {
                throw new Error("Authorizaton Restricted")
            }

            return user;    
    }

    async logout(req, res) {
        const userEmail = req.userEmail;
        const user = await this.verifyUser(userEmail);

        const options = {
            httpOnly: true,
            secure: false
        }

        // clear the cookies[access token, refresh token] from client side
        res.clearCookie("accessToken", options);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json({ message: "Logout Successful" });
    }

    async requestChangePassword(email, req, res) {
        const userEmail = email;
        console.log("Email: " + userEmail)
  
        const response = await this.EmailService.sendVerificationEmail(userEmail);


        return res.status(201).json({ message: 'Verification email sent' });
    }

    async getAccountInfo(email, req, res)
    {
        const user = await this.login_info_Repository.findOne({
            where: {email: email}
        })

        if(!user)
        {
            return res.status(401).json({message: "User not Found!"})
        }
        return res.status(201).json({message: "Email exits"});

    }

    async forgetPassword(data, res) {
        const { token, newPassword } = data;
 
        // Verify the token
        const email = await this.EmailService.verifyEmailToken(token);
        console.log("Email from token"+email)

        // Hash the new password
        const hashedPassword = await this.passwordHasing(newPassword);

        // Update the password in the database
        await this.login_info_Repository.update(
            { email },
            { password: hashedPassword }
        );

        return res.status(201).json({ message: 'Password changed successfully' });
    }


    async changePassword(data, req, res) {
        const userEmail = req.userEmail;
        console.log("userEmail Change Password", userEmail);
        const user = await this.verifyUser(userEmail);

        const {oldPassword, newPassword} = data;

        // Check password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            console.error('Password mismatch: OldPassword:', oldPassword, 'HashedPassword:', user.password);
            throw new Error('Old password is incorrect.');
            // return res.json({ message: "Passwords didn't match." });
        }

        const hashedPassword = await this.passwordHasing(newPassword);

        await this.login_info_Repository.update(
            { email: user.email },
            { password: hashedPassword })

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: "Password changed successfully." })
    }
}
