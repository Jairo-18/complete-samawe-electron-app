import { CronJobModule } from './cronJobs/cronJob.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GenericTypeModule } from './types/genericType.module';
import { ExcursionModule } from './excursions/excursion.module';
import { ProductModule } from './products/product.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { SharedModule } from './shared/shared.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AccommodationModule } from './accommodations/accommodation.module';
import { InvoiceModule } from './invoices/invoice.module';
import { EarningModule } from './earnings/earning.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    SharedModule.forRoot(),
    AccommodationModule,
    AuthModule,
    ExcursionModule,
    ProductModule,
    UserModule,
    GenericTypeModule,
    InvoiceModule,
    EarningModule,
    CloudinaryModule,
    CronJobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
