import { Module } from '@nestjs/common';
import { MailController } from './infrastructure/controllers/mail.controller';
import { MailService } from './application/services/mail.service';
import { MailTemplateService } from './application/services/mail-template.service';
import { NodemailerMailProvider } from './infrastructure/providers/nodemailer-mail.provider';
import { SmtpConfigService } from './infrastructure/config/smtp-config.service';
import { MailKafkaListener } from './infrastructure/kafka/mail-kafka.listener';

@Module({
  imports: [],
  controllers: [MailController, MailKafkaListener],
  providers: [
    MailService,
    MailTemplateService,
    {
      provide: 'MailProvider',
      useClass: NodemailerMailProvider,
    },
    SmtpConfigService,
  ],
  exports: [MailService],
})
export class MailModule {}
