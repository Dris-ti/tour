import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';

interface EmailVerificationPayload {
    email: string;
}


@Injectable()
export class EmailService {
     private transporter;  
        constructor() {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER, 
                    pass: process.env.EMAIL_PASSWORD, 
                },
            });
        }

        
    
        async sendEmail(to, subject, body) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                html: body,
            };
    
            await this.transporter.sendMail(mailOptions);
        }
    
        generateVerificationToken(email) {
            const token = jwt.sign(
                { 
                    email
                },
                process.env.EMAIL_VERIFICATION_SECRET, 
                { expiresIn: process.env.EMAIL_VERIFICATION_SECRET_EXPIRY } 
            );

            return token;
        }
    
        async sendVerificationEmail(email) {
            const token = this.generateVerificationToken(email);
            console.log("email: " + email);
            console.log("TOken: " + token)
            const resetLink = `http://localhost:3001/PasswordChange?token=${token}`;

            const html = `
                <h1>Password Reset Request</h1>
                <p>Click the link below to reset your password:</p>
                <p>Token: ${token}</p>
                <a href="${resetLink}" target="_blank">Reset Password Link</a>
                <p>If you did not request this, please ignore this email.</p>
                <p>This link will expire in ${process.env.EMAIL_VERIFICATION_SECRET_EXPIRY}.</p>
            `;

            return await this.sendEmail(email, 'Reset Your Password', html);
        }
    
        async verifyEmailToken(token) {
            try {
                const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET) as EmailVerificationPayload;
                return decoded.email; 
            } 
            catch (error) {
                throw new Error('Invalid or expired token' + error);
            }
        }
}
