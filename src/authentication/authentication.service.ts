import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';


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
                where: { email: email } // Ensure the user relation is fetched
            }
        );

        console.log(user)

        if (!user) {
            return res.json({ message: "User not found!" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user['password']);

        if (!isMatch) {
            return res.json({ message: "Credentials didn't match." });
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
            user_id: user.user_id,
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


    async verifyUser(req, res) {
        // Get token from the cookie or the header
        const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.json({ message: "Unauthorized request!" })
        }

        try {
            //decode the token
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as EmailVerificationPayload;

            console.log(decodedToken)

            // get email using decoded token [nessesary to find the user]
            const userEmail = decodedToken.email;

            // find the user
            const user = await this.login_info_Repository.findOne({
                where: { email: userEmail }
            });

            // check if the user has valid refresh token
            if (!user) {
                return res.json({ message: "Invalid Access Token" });
            }

            return user;
        }
        catch {
            return res.json({ message: "Something went wrong while verifing" })
        }

    }

    async logout(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const options = {
            httpOnly: true,
            secure: false
        }

        // clear the cookies[access token, refresh token] from client side
        res.clearCookie("accessToken", options);
        res.clearCookie("refreshToken", options);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({ message: "Logout Successful" });
    }

    async requestChangePassword(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        await this.EmailService.sendVerificationEmail(user.email);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
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
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const {oldPassword, newPassword} = data;

        const userEmail = user.email;

        // Check password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            console.error('Password mismatch: OldPassword:', oldPassword, 'HashedPassword:', user.password);
    throw new Error('Old password is incorrect.');
            // return res.json({ message: "Passwords didn't match." });
        }

        const hashedPassword = await this.passwordHasing(newPassword);

        await this.login_info_Repository.update(
            { email: userEmail },
            { password: hashedPassword })

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: "Password changed successfully." })
    }
}
