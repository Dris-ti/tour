import { Injectable } from '@nestjs/common';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO } from './DB.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { emit } from 'process';
import { EmailService } from './admin.EmailService';



@Injectable()
export class AdminService {
    constructor(
        @InjectRepository
            (LOGIN_INFO)
        private login_info_Repository: Repository<LOGIN_INFO>,

        @InjectRepository
            (USER_INFO)
        private user_info_Repository: Repository<USER_INFO>,

        @InjectRepository
            (AGENCY_INFO)
        private agency_info_Repository: Repository<AGENCY_INFO>,

        @InjectRepository
            (BOOKING_INFO)
        private booking_info_Repository: Repository<BOOKING_INFO>,

        @InjectRepository
            (PACKAGE_INFO)
        private package_info_Repository: Repository<PACKAGE_INFO>,

        @InjectRepository
            (TRANSPORT_INFO)
        private transport_info_Repository: Repository<TRANSPORT_INFO>,

        @InjectRepository
            (PAYMENT_INFO)
        private payment_info_Repository: Repository<PAYMENT_INFO>,

        @InjectRepository
            (DESTINATION_INFO)
        private destination_info_Repository: Repository<DESTINATION_INFO>,

        @InjectRepository
            (REVIEW_INFO)
        private review_info_Repository: Repository<REVIEW_INFO>,
        private EmailService: EmailService
    ) { }


    async passwordHasing(data) {
        //  let password = data['password'];
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

    generateRefreshToken(user) {
        return jwt.sign(
            // Payload
            {
                id: user.id,
                email: user.email,
            },
            // Access Token Secret
            process.env.REFRESH_TOKEN_SECRET,
            // Expiry
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }

    async login(data, res) {
        let email = data['email'];
        let password = data['password'];

        // Find user
        const user = await this.login_info_Repository.findOne(
            {
                where: { email }
            }
        );

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
        const refreshToken = this.generateRefreshToken(user);

        // Cannot modify cookies from the client site
        const options = {
            httpOnly: true,
            secure: false
        }

        // send access token and refresh token to the user using cookie
        return res
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
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
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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

        return res.json({ message: "Logout Successful" });
    }

    async editAdminProfile(data, req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const userEmail = user['email'];

        const row_userInfoTable = await this.user_info_Repository.findOne({ where: { email: userEmail } });
        const row_loginInfoTable = await this.login_info_Repository.findOne({ where: { email: userEmail } })

        if (!row_userInfoTable || !row_loginInfoTable) {
            return res.json({ message: "User not found!" });
        }

        const userInfoData = {
            name: data.name ? data.name : row_userInfoTable.name,
            phone_no: data.phone_no ? data.phone_no : row_userInfoTable.phone_no,
            dob: data.dob ? data.dob : row_userInfoTable.dob,
            gender: data.gender ? data.gender : row_userInfoTable.gender,
            nid_no: data.nid_no ? data.nid_no : row_userInfoTable.nid_no,
            nid_pic_path: data.nid_pic_path ? data.nid_pic_path : row_userInfoTable.nid_pic_path,
            description: data.description ? data.description : row_userInfoTable.description,
            user_type: "Admin",
            profile_pic_path: data.profile_pic_path ? data.profile_pic_path : row_userInfoTable.profile_pic_path,
            email: user.email, 
            address: data.address ? data.address : row_userInfoTable.address,
            status: "Active"
        }

        const updatedInfo_userInfoTable = Object.assign(row_userInfoTable, userInfoData);

        await this.user_info_Repository.save(updatedInfo_userInfoTable)

        return res.json({ message: "Profile updated successfully." })
    }

    async requestChangePassword(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        await this.EmailService.sendVerificationEmail(user.email);
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

        const userEmail = user.email;
        const old_password = user.password;

        console.log(data.oldPassword);

        // Check password
        const isMatch = await bcrypt.compare(data.oldPassword, old_password);

        if (!isMatch) {
            return res.json({ message: "Passwords didn't match." });
        }

        const hashedPassword = await this.passwordHasing(data.newPassword);

        await this.login_info_Repository.update(
            { email: userEmail },
            { password: hashedPassword })

        return res.json({ message: "Password changed successfully." })
    }

    async showTourGuides(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const guides = await this.user_info_Repository.findBy({
            user_type: "Guide",
            status: "Active",
        });

        return res.json({ message: "All Tour guides Information", data: guides });
    }

    async showTourAgencies(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const agencies = await this.agency_info_Repository.findBy({ status: "Active" });

        return res.json({ message: "All Tour Agency Information", data: agencies });
    }

    async removeTourGuide(req, res, id) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        try {
            await this.user_info_Repository.delete(id);
            await this.login_info_Repository.delete(id);

            return res.json({ message: "Guide removed successfully" })
        }
        catch (error) {
            return res.json({ message: "Something went wrong while removing the guide." })
        }
    }

    async removeTourAgency(req, res, id) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        try {
            await this.agency_info_Repository.delete(id);
            await this.login_info_Repository.delete(id);

            return res.json({ message: "Agency removed successfully" })
        }
        catch (error) {
            return res.json({ message: "Something went wrong while removing the agency." })
        }
    }

    async acceptTourGuide(id, req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        await this.user_info_Repository.update(
            { id: id },
            { status: "Active" }
        )

        return res.json({ message: "Guide request approved" });
    }

    async acceptTourAgency(id, req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        await this.agency_info_Repository.update(
            { id: id },
            { status: "Active" }
        )

        return res.json({ message: "Agency request approved" });
    }


    // -----------------------------------------------------------------------
    async registerTourAgency(data) {
        const agencyData = {
            name: data.name,
            email: data.email,
            address: data.address,
            company_size: data.company_size,
            description: data.description,
            phone_no: data.phone_no,
            status: data.status,
        };

        const agency = await this.agency_info_Repository.save(agencyData);
        const hashedPass = await this.passwordHasing(data['password']);

        console.log(agency.id);

        const loginData = {
            email: data.email,
            password: hashedPass,
            user_type: "Agency",
            user_id: agency.id
        };

        await this.login_info_Repository.save(loginData);

        return { message: "Agency register successfully." }
    }

    async registerTourGuide(data) {
        const guideData = {
            name: data.name,
            email: data.email,
            address: data.address,
            dob: data.dob,
            gender: data.gender,
            nid_pic_path: data.nid_pic_path,
            description: data.description,
            user_type: data.user_type,
            profile_pic_path: data.profile_pic_path,
            phone_no: data.phone_no,
            status: data.status,
            nid_no: data.nid_no
        };

        const guide = await this.user_info_Repository.save(guideData);
        const hashedPass = await this.passwordHasing(data['password']);

        console.log(guide.id);

        const loginData = {
            email: data.email,
            password: hashedPass,
            user_type: "Guide",
            user_id: guide.id
        };

        await this.login_info_Repository.save(loginData);

        return { message: "Guide register successfully." }
    }

    async addPaymentDetails(data) {
        return await this.payment_info_Repository.save(data);
    }
    // -----------------------------------------------------------------------

    async addAdmin(data, req, res) {
        
        const user = await this.verifyUser(req, res)
        
        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const email = data.email;
        let password = "";

        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';

        for (let i = 1; i <= 8; i++) {
            let char = Math.floor(Math.random()
                * str.length + 1);

            password += str.charAt(char)
        }

        const userData = {
            email: email,
            user_type: "Admin",
            status: "Active",
            name: " ",
            address: " ",
            dob: "2000-01-01",
            gender: " ",
            nid_pic_path: " ",
            description: " ",
            profile_pic_path: " ",
            phone_no: " ",
            nid_no: " "
        }

        const newUser = await this.user_info_Repository.save(userData);

        const loginData = {
            email: email,
            password: await this.passwordHasing(password),
            user_id: newUser.id
        }

        await this.login_info_Repository.save(loginData);

        return res.json({
            email: email,
            password: password,
        });
    }

    // async removeAdmin(id, req, res) {
    //     const user = await this.verifyUser(req, res)

    //     if (!user) {
    //         return res.json({ message: "Invalid or expired session!" });
    //     }

    //     const user_status = await this.user_info_Repository.findOne(
    //         { where: { id: user.user_id } }
    //     )

    //     if (user_status.user_type != "Admin") {
    //         return res.json({ message: "Only Admin has access to this." });
    //     }

    //     try {
    //         await this.user_info_Repository.delete(id);
    //         const login_id = await this.login_info_Repository.findOne({ where: { user_id: id } })
    //         console.log(login_id);
    //         await this.login_info_Repository.delete(login_id.id);

    //         return res.json({ message: "Admin removed successfully" })
    //     }
    //     catch (error) {
    //         return res.json({ message: "Something went wrong while removing the Admin." })
    //     }
    // }

    async monthlyTransaction(data, req, res) {
        const user = await this.verifyUser(req, res)
        
        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }
        
        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )
        
        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const startDate = new Date(data.year, data.month - 1, 1);
        const endDate = new Date(data.year, data.month, 0);

        const result = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("payment.*")
            .addSelect("SUM(payment.amount)", "total_amount")
            .where("payment.payment_date BETWEEN :startDate AND :endDate", { startDate, endDate })
            .groupBy("payment.id")
            .orderBy("payment.payment_date", "ASC")
            .getRawMany();

        const totalAmount = result.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
        
        return res.json({
            transactions: result,
            total_amount: totalAmount
        });
    }


    async yearlyTransaction(data, req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const startDate = new Date(data.year, 0, 1); 
        const endDate = new Date(data.year, 11, 31, 23, 59, 59); 

        const result = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("payment.*") 
            .addSelect("SUM(payment.amount)", "total_amount")
            .where("payment.payment_date BETWEEN :startDate AND :endDate", { startDate, endDate })
            .groupBy("payment.id") 
            .orderBy("payment.payment_date", "ASC")
            .getRawMany();

        const totalAmount = result.reduce((sum, transaction) => sum + Number(transaction.amount), 0);

        return res.json({
            transactions: result,
            total_amount: totalAmount
        });
    }

    async userCount(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const tourists = await this.user_info_Repository.count({where: {user_type:"User"}})
        const guides = await this.user_info_Repository.count({where: {user_type:"Guide"}})
        const agencies = await this.agency_info_Repository.count();

        return res.json({
            "Total Users": tourists,
            "Total Guides": guides,
            "Total Agencies": agencies

        });
    }

    async profit(req, res) {
        const user = await this.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        const prediction = await this.payment_info_Repository
        .createQueryBuilder("payment")
        .select("AVG(payment.amount)", "average")
        .where("payment.payment_date >= :startDate", {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
        })
        .getRawOne();

        const cmStart = new Date(new Date().getFullYear(),  new Date().getMonth(), 1)
        const cmEnd = new Date(new Date().getFullYear(),  new Date().getMonth() + 1, 0)

        const currMonthTotal = await this.payment_info_Repository
        .createQueryBuilder("payment")
        .select("SUM(payment.amount)", "total_amount")
        .where("payment.payment_date BETWEEN :startDate AND :endDate", {
            startDate: cmStart,
            endDate: cmEnd
        })
        .getRawOne();


        const pmStart = new Date(new Date().getFullYear(),  new Date().getMonth() - 1, 1)
        const pmEnd = new Date(new Date().getFullYear(),  new Date().getMonth(), 0)

        const preMonthTotal = await this.payment_info_Repository
        .createQueryBuilder("payment")
        .select("SUM(payment.amount)", "total_amount")
        .where("payment.payment_date BETWEEN :startDate AND :endDate", {
            startDate: pmStart,
            endDate: pmEnd
        })
        .getRawOne();


        const profit = (currMonthTotal?.total_amount || 0) - (preMonthTotal?.total_amount || 0);
        const profitPercentage = (profit/(currMonthTotal?.total_amount || 1)) * 100;

        return res.json({
            "Profit": profit.toFixed(2),
            "Profit Percentage": profitPercentage.toFixed(2) + "%",
            "Next month Preditction": Number(prediction.average).toFixed(2)
        });
    }


}
