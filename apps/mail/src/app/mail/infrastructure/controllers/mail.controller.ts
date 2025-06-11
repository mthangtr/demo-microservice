import { Controller, Logger, Post, Get, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { MailService } from '../../application/services/mail.service';

@Controller('mail')
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(private readonly mailService: MailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() data: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    cc?: string;
    bcc?: string;
  }) {
    this.logger.log(`Received request to send email to ${data.to}`);

    try {
      const recipients = data.to.split(',').map(email => email.trim());
      const ccRecipients = data.cc?.split(',').map(email => email.trim());
      const bccRecipients = data.bcc?.split(',').map(email => email.trim());

      const result = await this.mailService.sendEmail({
        to: recipients,
        subject: data.subject,
        text: data.text,
        html: data.html,
        cc: ccRecipients,
        bcc: bccRecipients
      });

      return { success: result, error: null };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @Post('send-template')
  @HttpCode(HttpStatus.OK)
  async sendTemplateEmail(@Body() data: {
    to: string;
    templateName: string;
    context: Record<string, any>;
    cc?: string;
    bcc?: string;
  }) {
    this.logger.log(`Received request to send template email ${data.templateName} to ${data.to}`);

    try {
      const recipients = data.to.split(',').map(email => email.trim());
      const ccRecipients = data.cc?.split(',').map(email => email.trim());
      const bccRecipients = data.bcc?.split(',').map(email => email.trim());

      const result = await this.mailService.sendTemplateEmail(
        recipients,
        data.templateName,
        data.context,
        {
          cc: ccRecipients,
          bcc: bccRecipients
        }
      );

      return { success: result, error: null };
    } catch (error) {
      this.logger.error(
        `Failed to send template email: ${error.message}`, 
        error.stack
      );
      return { success: false, error: error.message };
    }
  }

  @Get('verify')
  async verifyConnection() {
    try {
      const result = await this.mailService.verifyConnection();
      return { success: result, error: null };
    } catch (error) {
      this.logger.error(
        `Failed to verify mail connection: ${error.message}`, 
        error.stack
      );
      return { success: false, error: error.message };
    }
  }

  // This endpoint will be useful for future Kafka integration tests
  @Get('health')
  async healthCheck() {
    return { status: 'ok' };
  }
}
