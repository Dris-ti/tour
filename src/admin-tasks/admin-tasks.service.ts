import { Injectable } from '@nestjs/common';
import { AGENCY_INFO, LOGIN_INFO, PAYMENT_INFO, USER_INFO } from '../database/database.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';



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
            (PAYMENT_INFO)
        private payment_info_Repository: Repository<PAYMENT_INFO>,

        private authService: AuthenticationService,
        private activityLog: ActivityLogService
    ) { }


    async editAdminProfile(data, req, res) {
        const user = await this.authService.verifyUser(req, res)

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

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({ message: "Profile updated successfully." })
    }



    async showTourGuides(req, res) {
        const user = await this.authService.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const guides = await this.user_info_Repository.findBy({
            user_type: "Guide",
            status: "Active",
        });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: "All Tour guides Information", data: guides });
    }

    async showTourAgencies(req, res) {
        const user = await this.authService.verifyUser(req, res)

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

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: "All Tour Agency Information", data: agencies });
    }

    async removeTourGuide(req, res, id) {
        const user = await this.authService.verifyUser(req, res)

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

            // Save activity log
            await this.activityLog.addLog({
                user_id: user.id,
                method: req.method,
                url: req.url,
                createdAt: new Date(),
            });

            return res.json({ message: "Guide removed successfully" })
        }
        catch (error) {
            return res.json({ message: "Something went wrong while removing the guide." })
        }
    }

    async removeTourAgency(req, res, id) {
        const user = await this.authService.verifyUser(req, res)

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

            // Save activity log
            await this.activityLog.addLog({
                user_id: user.id,
                method: req.method,
                url: req.url,
                createdAt: new Date(),
            });

            return res.json({ message: "Agency removed successfully" })
        }
        catch (error) {
            return res.json({ message: "Something went wrong while removing the agency." })
        }
    }

    async acceptTourGuide(id, req, res) {
        const user = await this.authService.verifyUser(req, res)

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

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({ message: "Guide request approved" });
    }

    async acceptTourAgency(id, req, res) {
        const user = await this.authService.verifyUser(req, res)

        if (!user) {
            return res.json({ message: "Invalid or expired session!" });
        }

        const user_status = await this.user_info_Repository.findOne(
            { where: { id: user.user_id } }
        )

        if (user_status.user_type != "Admin") {
            return res.json({ message: "Only Admin has access to this." });
        }

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

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
        const hashedPass = await this.authService.passwordHasing(data['password']);

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
        const hashedPass = await this.authService.passwordHasing(data['password']);

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

        const user = await this.authService.verifyUser(req, res)

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
            password: await this.authService.passwordHasing(password),
            user_id: newUser.id
        }

        await this.login_info_Repository.save(loginData);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({
            email: email,
            password: password,
        });
    }
}
