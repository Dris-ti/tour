import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { Repository } from 'typeorm';
import { ActivityLogService } from 'src/activity-log/activity-log.service';
import { USER_INFO } from 'src/database/entities/user_info.entity';
import { AGENCY_INFO } from 'src/database/entities/agency_info.entity';
import { PAYMENT_INFO } from 'src/database/entities/payment_info.entity';

@Injectable()
export class AdminDashboardService {
    constructor(
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
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

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
            user_id: user.user_id.id,
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
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

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
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({
            transactions: result,
            total_amount: totalAmount
        });
    }


    async allYearlyTransaction(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        try {
            const yearlyProfit = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("TO_CHAR(payment.payment_date, 'YYYY')", "year")
            .addSelect("SUM(payment.amount)", "total_amount")
            .groupBy("TO_CHAR(payment.payment_date, 'YYYY')")
            .orderBy("TO_CHAR(payment.payment_date, 'YYYY')", "DESC")
            .getRawMany();


            // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });
      
          return res.status(201).json(yearlyProfit);

        } catch (error) {
          console.error("Error fetching yearly profit:", error);
          return res.status(500).json({ message: "Failed to fetch yearly profit." + error });
        }
      }

      async allMonthlyTransactionByYear(year, req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        try{
            const monthlyTransactions = await this.payment_info_Repository
            .createQueryBuilder("payment")
            .select("EXTRACT(MONTH FROM payment.payment_date)", "month")
            .addSelect("SUM(payment.amount)", "total_transaction")
            .where("EXTRACT(YEAR FROM payment.payment_date) = :year", { year })
            .groupBy("EXTRACT(MONTH FROM payment.payment_date)")
            .orderBy("EXTRACT(MONTH FROM payment.payment_date)", "ASC")
            .getRawMany();

            // Save activity log
            await this.activityLog.addLog({
                user_id: user.user_id.id,
                method: req.method,
                url: req.url,
                createdAt: new Date(),
            });
          
            return res.status(201).json(monthlyTransactions);
    
        } catch (error) {
            console.error("Error fetching monthly profit:", error);
            return res.status(500).json({ message: "Failed to fetch monthly profit." + error });
        }


      }
      

    async userCount(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        const tourists = await this.user_info_Repository.count({ where: { user_type: "User" } })
        const guides = await this.user_info_Repository.count({ where: { user_type: "Guide" } })
        const agencies = await this.agency_info_Repository.count();

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });


        return res.json({
            "Users": tourists,
            "Guides": guides,
            "Agencies": agencies

        });
    }

    async profit(req, res) {
        const userEmail = req.userEmail;
        const user = await this.authService.verifyUser(userEmail);

        let prediction = await this.payment_info_Repository
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


        const profit = ((currMonthTotal?.total_amount || 0) - (preMonthTotal?.total_amount || 0).toFixed(2));
        const profitPercentage = ((profit / (currMonthTotal?.total_amount || 1)) * 100).toFixed(2);
       prediction = Number(prediction.average);

        // Save activity log
        await this.activityLog.addLog({
            user_id: user.user_id.id,
            method: req.method,
            url: req.url,
            createdAt: new Date(),
        });



        
        return res.json({
            "Profit": profit,
            "ProfitPercentage": profitPercentage + "%",
            "Prediction": Number(prediction).toFixed(2)
        });
    }
}
