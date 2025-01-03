import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';


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
        
            const html = `
                <h1>Password Change Request</h1>
                <p>Your verification code is: ${token}</p>      
                <p>This code will expire in ${process.env.EMAIL_VERIFICATION_SECRET_EXPIRY}.</p>
            `;
        
            return await this.sendEmail(email, 'Change Password Verification', html);
        }
    
        async verifyEmailToken(token) {
            try {
                const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);
                return decoded.email; 
            } 
            catch (error) {
                throw new Error('Invalid or expired token');
            }
        }
}
