import { Module } from '@nestjs/common';
import { MailController } from './infrastructure/controllers/mail.controller';
import { MailService } from './application/services/mail.service';
import { MailTemplateService } from './application/services/mail-template.service';
import { NodemailerMailProvider } from './infrastructure/providers/nodemailer-mail.provider';
import { SmtpConfigService } from './infrastructure/config/smtp-config.service';
import { MailKafkaListener } from './infrastructure/kafka/mail-kafka.listener';

@Module({
  imports: [
    // KafkaModule will be added here when implemented
  ],
  controllers: [MailController],
  providers: [
    MailService,
    MailTemplateService,
    {
      provide: 'MailProvider',
      useClass: NodemailerMailProvider,
    },
    SmtpConfigService,
    MailKafkaListener, // Placeholder for Kafka integration
  ],
  exports: [MailService],
})
export class MailModule {}
