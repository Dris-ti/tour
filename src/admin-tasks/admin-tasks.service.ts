import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Equal, Repository } from 'typeorm';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { LOGIN_INFO } from 'src/database/entities/login_info.entity';
import { USER_INFO } from 'src/database/entities/user_info.entity';
import { AGENCY_INFO } from 'src/database/entities/agency_info.entity';
import { PAYMENT_INFO } from 'src/database/entities/payment_info.entity';
import { ACTIVITY_LOG_INFO } from 'src/database/entities/activity_log_info.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(LOGIN_INFO)
        private login_info_Repository: Repository<LOGIN_INFO>,

        @InjectRepository(USER_INFO)
        private user_info_Repository: Repository<USER_INFO>,

        @InjectRepository(AGENCY_INFO)
        private agency_info_Repository: Repository<AGENCY_INFO>,

        @InjectRepository(PAYMENT_INFO)
        private payment_info_Repository: Repository<PAYMENT_INFO>,

        @InjectRepository(ACTIVITY_LOG_INFO)
        private activity_log_info_Repository: Repository<ACTIVITY_LOG_INFO>,

        private authService: AuthenticationService,
        private activityLog: ActivityLogService,
    ) { }

    async editAdminProfile(data, req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        console.log(user);

        Object.assign(user.user_id, data);

        // Save the updated USER_INFO entity to the database
        await this.user_info_Repository.save(user.user_id);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json({ message: 'Profile updated successfully.' });
    }

    async showTourGuides(req, res, status) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const guides = await this.user_info_Repository.findBy({
            user_type: 'Guide',
            status: status,
        });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(guides); 
    }


    async showAdmins(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const admins = await this.user_info_Repository.findBy({
            user_type: 'Admin'
        });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(admins); 
    }

    async showTourAgencies(req, res, status) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const agencies = await this.agency_info_Repository.find(
            {
                where:{status: status}
            }
        );

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(agencies); 
    }

    async showAgencyInfoById(req, res, id) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const agencies = await this.agency_info_Repository.findOne({
            where: {id: id}
        });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(agencies); 
    }

    async showGuideInfoById(req, res, id) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const guide = await this.user_info_Repository.findOne({
            where: {id: id}
        });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(guide); 
    }

    async removeTourGuide(req, res, id) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        try {
            await this.user_info_Repository.delete(id);
            await this.login_info_Repository.delete(id);

            // Save activity log
            await this.activityLog.addLog({
                user_id: user.user_id.id,
                method: req.method,
                url: req.url,
                createdAt: new Date(),
            });

            return res.status(201).json({ message: 'Guide removed successfully' });
        } catch (error) {
            return res.json({
                message: 'Something went wrong while removing the guide.',
            });
        }
    }

    async removeTourAgency(req, res, id) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        try {
            await this.agency_info_Repository.delete(id);
            await this.login_info_Repository.delete(id);

            // Save activity log
            await this.activityLog.addLog({
                user_id: user.user_id.id,
                method: req.method,
                url: req.url,
                createdAt: new Date(),
            });

            return res.status(201).json({ message: 'Agency removed successfully' });
        } catch (error) {
            return res.json({
                message: 'Something went wrong while removing the agency.',
            });
        }
    }

    async acceptTourGuide(id, req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        await this.user_info_Repository.update({ id: id }, { status: 'Active' });

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json({ message: 'Guide request approved' });
    }

    async acceptTourAgency(id, req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        await this.agency_info_Repository.update({ id: id }, { status: 'Active' });

        return res.status(201).json({ message: 'Agency request approved' });
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
            user_type: 'Agency',
            // user_id: agency.id
        };

        await this.login_info_Repository.save(loginData);

        return { message: 'Agency register successfully.' };
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
            nid_no: data.nid_no,
        };

        const guide = await this.user_info_Repository.save(guideData);
        const hashedPass = await this.authService.passwordHasing(data['password']);

        console.log(guide.id);

        const loginData = {
            email: data.email,
            password: hashedPass,
            user_type: 'Guide',
            // user_id: guide.id
        };

        await this.login_info_Repository.save(loginData);

        return { message: 'Guide register successfully.' };
    }

    async addPaymentDetails(data) {
        return await this.payment_info_Repository.save(data);
    }
    // -----------------------------------------------------------------------

    generatePassword()
    {
        let password = '';
        const str =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

        for (let i = 1; i <= 8; i++) {
            let char = Math.floor(Math.random() * str.length + 1);

            password += str.charAt(char);
        }
        return password;
    }

    async addAdmin(data, req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const email = data.email;
        const emailUsed = await this.user_info_Repository.findOne({
            where: { email: email },
        });

        if (emailUsed) {
            return res.status(401).json({ message: 'Email is already in use' });
        }

        const password = this.generatePassword();

        const userData = {
            email: email,
            user_type: 'Admin',
            status: 'Active',
        };

        const newUser = await this.user_info_Repository.save(userData);
        console.log('new user:');
        console.log(newUser);

        const loginData = {
            email: email,
            password: await this.authService.passwordHasing(password),
            user_id: newUser,
        };

        await this.login_info_Repository.save(loginData);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json({
            email: email,
            password: password,
        });
    }

    async getProfileActivityLog(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const logs = await this.activity_log_info_Repository.find({
            where: { user_id: Equal(user.user_id.id) },
        });

        console.log(logs);

        return res.status(201).json(logs);
    }

    async showAdminProfile(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.status(201).json(
            await this.user_info_Repository.findOne({
                where: { id: user.user_id.id },
            }),
        );
    }
}
