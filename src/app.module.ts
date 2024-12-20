import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database/database.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [AdminModule, DatabaseModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
