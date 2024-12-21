import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { AGENCY_INFO, BOOKING_INFO, DESTINATION_INFO, LOGIN_INFO, PACKAGE_INFO, PAYMENT_INFO, REVIEW_INFO, TRANSPORT_INFO, USER_INFO } from '../database/database.entity';
import { Repository } from 'typeorm';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Injectable()
export class AdminDashboardService {
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
    async monthlyTransaction(data, req, res) {
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

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        return res.json({
            transactions: result,
            total_amount: totalAmount
        });
    }


    async yearlyTransaction(data, req, res) {
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

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({
            transactions: result,
            total_amount: totalAmount
        });
    }

    async userCount(req, res) {
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

        const tourists = await this.user_info_Repository.count({ where: { user_type: "User" } })
        const guides = await this.user_info_Repository.count({ where: { user_type: "Guide" } })
        const agencies = await this.agency_info_Repository.count();

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({
            "Total Users": tourists,
            "Total Guides": guides,
            "Total Agencies": agencies

        });
    }

    async profit(req, res) {
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

        const prediction = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("AVG(payment.amount)", "average")
            .where("payment.payment_date >= :startDate", {
                startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1),
            })
            .getRawOne();

        const cmStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const cmEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

        const currMonthTotal = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("SUM(payment.amount)", "total_amount")
            .where("payment.payment_date BETWEEN :startDate AND :endDate", {
                startDate: cmStart,
                endDate: cmEnd
            })
            .getRawOne();


        const pmStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
        const pmEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0)

        const preMonthTotal = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("SUM(payment.amount)", "total_amount")
            .where("payment.payment_date BETWEEN :startDate AND :endDate", {
                startDate: pmStart,
                endDate: pmEnd
            })
            .getRawOne();


        const profit = (currMonthTotal?.total_amount || 0) - (preMonthTotal?.total_amount || 0);
        const profitPercentage = (profit / (currMonthTotal?.total_amount || 1)) * 100;

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });

        
        return res.json({
            "Profit": profit.toFixed(2),
            "Profit Percentage": profitPercentage.toFixed(2) + "%",
            "Next month Preditction": Number(prediction.average).toFixed(2)
        });
    }
}
