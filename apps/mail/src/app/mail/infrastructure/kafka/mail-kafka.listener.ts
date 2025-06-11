import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../application/services/mail.service';

/**
 * This is a placeholder for the future Kafka implementation.
 * When you're ready to implement Kafka, you can expand this class
 * with the appropriate decorators and methods.
 */
@Injectable()
export class MailKafkaListener {
  private readonly logger = new Logger(MailKafkaListener.name);

  constructor(private readonly mailService: MailService) {}

  /**
   * Example of how to handle a Kafka message for sending an email
   * Uncomment and implement when adding Kafka
   */
  // @KafkaListener('mail-topic', 'send-email-group')
  async handleSendEmail(data: any) {
    this.logger.log(`Received Kafka message to send email to ${data.to}`);

    try {
      const recipients = Array.isArray(data.to) ? data.to : [data.to];
      const result = await this.mailService.sendEmail({
        to: recipients,
        subject: data.subject,
        text: data.text,
        html: data.html,
        cc: data.cc,
        bcc: data.bcc
      });

      return result;
    } catch (error) {
      this.logger.error(`Failed to process Kafka message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Example of how to handle a Kafka message for sending a template email
   * Uncomment and implement when adding Kafka
   */
  // @KafkaListener('mail-topic', 'send-template-email-group')
  async handleSendTemplateEmail(data: any) {
    this.logger.log(`Received Kafka message to send template email ${data.templateName}`);

    try {
      const recipients = Array.isArray(data.to) ? data.to : [data.to];
      const result = await this.mailService.sendTemplateEmail(
        recipients,
        data.templateName,
        data.context,
        {
          cc: data.cc,
          bcc: data.bcc
        }
      );

      return result;
    } catch (error) {
      this.logger.error(`Failed to process Kafka message: ${error.message}`, error.stack);
      throw error;
    }
  }
}
