import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IMailProvider } from '../../domain/interfaces/mail-provider.interface';
import { MailOptions } from '../../domain/models/mail-options.model';
import { SmtpConfigService } from '../config/smtp-config.service';

@Injectable()
export class NodemailerMailProvider implements IMailProvider {
  private readonly logger = new Logger(NodemailerMailProvider.name);
  private transporter: Transporter;

  constructor(private readonly smtpConfigService: SmtpConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.smtpConfigService.host,
        port: this.smtpConfigService.port,
        secure: this.smtpConfigService.secure,
        auth: {
          user: this.smtpConfigService.user,
          pass: this.smtpConfigService.password,
        },
      });

      this.logger.log(`SMTP transporter initialized for ${this.smtpConfigService.host}`);
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter', error.stack);
      throw error;
    }
  }

  async sendMail(options: MailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        ...options,
        from: options.from || `\"${this.smtpConfigService.defaultFromName}\" <${this.smtpConfigService.defaultFromAddress}>`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Message sent: ${info.messageId}`);
      return true;
    } catch (error) {
      this.logger.error('Error sending email', error.stack);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('SMTP connection verification failed', error.stack);
      return false;
    }
  }
}
