import { ExcursionImageRepository } from './repositories/excursionImage.repository';
import { AccommodationImageRepository } from './repositories/accommodationImage.repository';
import { ProductImage } from './entities/productImage.entity';
import { ProductImageRepository } from './repositories/productImage.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { PasswordService } from './../user/services/password.service';
import { InvoiceEventsListener } from './services/invoiceEventsListener.service';
import { BalanceService } from './services/balance.service';
import { InvoiceDetaillRepository } from './repositories/invoiceDetaill.repository';
import { InvoiceRepository } from './repositories/invoice.repository';
import { PayTypeRepository } from './repositories/payType.repository';
import { PaidTypeRepository } from './repositories/paidType.repository';
import { AdditionalRepository } from './repositories/additionalType.repository';
import { ExcursionRepository } from './repositories/excursion.repository';
import { StateTypeRepository } from './repositories/stateType.repository';
import { BedTypeRepository } from './repositories/bedType.repository';
import { AccommodationRepository } from './repositories/accommodation.repository';
import { RepositoryService } from './services/repositoriry.service';
import { StateType } from './entities/stateType.entity';
import { RoleTypeRepository } from './repositories/roleType.repository';
import { TaxeTypeRepository } from './repositories/taxeType.repository';
import { PhoneCodeRepository } from './repositories/phoneCode.repository';
import { PhoneCode } from './entities/phoneCode.entity';
import { AccessSessionsRepository } from './repositories/accessSessions.repository';
import { AccessSessions } from './entities/accessSessions.entity';
import { Invoice } from './entities/invoice.entity';
import { AdditionalType } from './entities/additionalType.entity';
import { PaidType } from './entities/paidType.entity';
import { PayType } from './entities/payType.entity';
import { TaxeType } from './entities/taxeType.entity';
import { CategoryTypeRepository } from './repositories/categoryType.repository';
import { ProductRepository } from './repositories/product.repository';
import { CategoryType } from './entities/categoryType.entity';
import { Product } from './entities/product.entity';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { RoleType } from './entities/roleType.entity';
import { IdentificationType } from './entities/identificationType.entity';
import { IdentificationTypeRepository } from './repositories/identificationType.repository';
import { BedType } from './entities/bedType.entity';
import { Accommodation } from './entities/accommodation.entity';
import { Excursion } from './entities/excursion.entity';
import { InvoiceType } from './entities/invoiceType.entity';
import { InvoiceTypeRepository } from './repositories/invoiceType.repository';
import { InvoiceDetaill } from './entities/invoiceDetaill.entity';
import { BalanceRepository } from './repositories/balance.repository';
import { Balance } from './entities/balance.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailsService } from './services/mails.service';
import { MailTemplateService } from './services/mail-template.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { GeneralInvoiceDetaillService } from './services/generalInvoiceDetaill.service';
import { Notification } from './entities/notification.entity';
import { AccommodationImage } from './entities/accommodationImage.entity';
import { ExcursionImage } from './entities/escursionImage.entity';

@Module({})
export class SharedModule {
  static forRoot(): DynamicModule {
    return {
      module: SharedModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath:
            process.env.NODE_ENV === 'production'
              ? '.env.production'
              : '.env.development',
          cache: true,
        }),

        EventEmitterModule.forRoot(),

        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            const environment = process.env.NODE_ENV || 'development';

            const sslEnabled = configService.get('DB_SSL') === 'true';

            console.log(`🚀 Configurando TypeORM para: ${environment}`);
            console.log(
              `📊 Base de datos: ${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_DATABASE')}`,
            );
            console.log(
              `🔒 SSL: ${sslEnabled ? 'habilitado' : 'deshabilitado'}`,
            );

            const config: any = {
              type: 'postgres',
              host: configService.get('DB_HOST'),
              port: configService.get<number>('DB_PORT'),
              username: configService.get('DB_USERNAME'),
              password: configService.get('DB_PASSWORD'),
              database: configService.get('DB_DATABASE'),
              entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
              autoLoadEntities: true,
              synchronize: false, // Siempre false, usar migraciones
              logging:
                environment === 'development' ? ['query', 'error'] : ['error'],
              extra: {
                max: 10,
                keepAlive: true,
                connectionTimeoutMillis: 30000,
                idleTimeoutMillis: 30000,
              },
            };

            // Configurar SSL solo si está habilitado
            if (sslEnabled) {
              config.ssl = {
                rejectUnauthorized: false, // Para Neon y otros servicios cloud
              };
            }

            return config;
          },
        }),

        PassportModule,

        TypeOrmModule.forFeature([
          AccessSessions,
          Accommodation,
          AdditionalType,
          Balance,
          BedType,
          CategoryType,
          Excursion,
          IdentificationType,
          Invoice,
          InvoiceDetaill,
          InvoiceType,
          Notification,
          PaidType,
          PayType,
          PhoneCode,
          Product,
          RoleType,
          TaxeType,
          StateType,
          User,
          ProductImage,
          AccommodationImage,
          ExcursionImage,
        ]),

        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get('JWT_SECRET_KEY'),
            signOptions: {
              expiresIn: configService.get('JWT_EXPIRES_IN') || '2h',
            },
          }),
        }),

        PassportModule.register({
          defaultStrategy: 'jwt',
        }),

        MailerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: {
              host: configService.get<string>('MAIL_HOST'),
              port: configService.get<number>('MAIL_PORT'),
              secure: configService.get<boolean>('MAIL_SECURE') || false,
              auth: {
                user: configService.get<string>('MAIL_USER'),
                pass: configService.get<string>('MAIL_PASSWORD'),
              },
            },
            defaults: {
              from: configService.get<string>('MAIL_SENDER'),
            },
          }),
        }),
      ],
      controllers: [],
      providers: [
        AccessSessionsRepository,
        AccommodationRepository,
        AdditionalRepository,
        BalanceRepository,
        BedTypeRepository,
        CategoryTypeRepository,
        ExcursionRepository,
        IdentificationTypeRepository,
        InvoiceRepository,
        InvoiceDetaillRepository,
        InvoiceTypeRepository,
        NotificationRepository,
        PaidTypeRepository,
        PayTypeRepository,
        PhoneCodeRepository,
        ProductRepository,
        RoleTypeRepository,
        StateTypeRepository,
        TaxeTypeRepository,
        UserRepository,
        BalanceService,
        RepositoryService,
        InvoiceEventsListener,
        MailsService,
        MailTemplateService,
        PasswordService,
        GeneralInvoiceDetaillService,
        ProductImageRepository,
        AccommodationImageRepository,
        ExcursionImageRepository,
      ],
      exports: [
        TypeOrmModule,
        ConfigModule,
        AccessSessionsRepository,
        AccommodationRepository,
        AdditionalRepository,
        BalanceRepository,
        BedTypeRepository,
        CategoryTypeRepository,
        ExcursionRepository,
        IdentificationTypeRepository,
        InvoiceRepository,
        InvoiceDetaillRepository,
        InvoiceTypeRepository,
        NotificationRepository,
        PaidTypeRepository,
        PayTypeRepository,
        PhoneCodeRepository,
        ProductRepository,
        RoleTypeRepository,
        StateTypeRepository,
        TaxeTypeRepository,
        UserRepository,
        BalanceService,
        RepositoryService,
        InvoiceEventsListener,
        MailsService,
        MailTemplateService,
        PasswordService,
        GeneralInvoiceDetaillService,
        ProductImageRepository,
        AccommodationImageRepository,
        ExcursionImageRepository,
      ],
    };
  }
}
