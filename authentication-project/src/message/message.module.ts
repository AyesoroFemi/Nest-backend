import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MessageService } from './message.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('nodemailer.host'),
          port: configService.get('nodemailer.port'),
          secure: false,
          auth: {
            user: configService.get('nodemailer.auth.user'),
            pass: configService.get('nodemailer.auth.pass'),
          },
        },
        defaults: {
          from: configService.get('nodemailer.from'),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
