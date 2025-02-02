import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { error } from 'console';


interface EmailVerificationPayload {
    email: string;
}

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
            .cookie("accessToken", accessToken, options)
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
                throw new error("Authorizaton Restricted")
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

    // async checkValidity(req, res) {
    //     // Check if accessToken cookie is present
    //     const accessToken = req.cookies.accessToken; // Access the cookie sent by the client
    
    //     if (!accessToken) {
    //         // If no accessToken, respond with 400
    //         return res.status(400).json({
    //             success: false,
    //             error: {
    //                 message: "Access token is missing. Please log in.",
    //             },
    //         });
    //     }

    // try {
    //     // Validate the token (you can implement your JWT verification here)
    //     const userEmail = await this.verifyUser(accessToken); // Assuming verifyUser checks the validity of the token

    //     if (!userEmail) {
    //         // If the user is invalid or token is not valid, return 400
    //         return res.status(400).json({
    //             success: false,
    //             error: {
    //                 message: "Invalid or expired access token.",
    //             },
    //         });
    //     }

    //     // If the token is valid, respond with 201
    //     return res.status(201).json({
    //         success: true,
    //         message: "Token is valid.",
    //     });
        
    // } catch (error) {
    //     console.error(error);
    //     return res.status(500).json({
    //         success: false,
    //         error: {
    //             message: "An error occurred while verifying the token.",
    //         },
    //     });
    // }
    // }

    async requestChangePassword(req, res) {
        const userEmail = req.userEmail;
        const user = await this.verifyUser(userEmail);

        await this.EmailService.sendVerificationEmail(user.email);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: 'Verification email sent' });
    }

    async forgetPassword(data) {
        const { token, newPassword } = data;

        // Verify the token
        const email = await this.EmailService.verifyEmailToken(token);

        // Hash the new password
        const hashedPassword = await this.passwordHasing(newPassword);

        // Update the password in the database
        await this.login_info_Repository.update(
            { email },
            { password: hashedPassword }
        );

        return { message: 'Password changed successfully' };
    }


    async changePassword(data, req, res) {
        const userEmail = req.userEmail;
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
