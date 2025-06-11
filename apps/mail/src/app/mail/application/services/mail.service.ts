import { Inject, Injectable, Logger } from '@nestjs/common';
import { IMailProvider } from '../../domain/interfaces/mail-provider.interface';
import { MailOptions } from '../../domain/models/mail-options.model';
import { MailTemplateService } from './mail-template.service';
import { SmtpConfigService } from '../../infrastructure/config/smtp-config.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject('MailProvider') private mailProvider: IMailProvider,
    private readonly mailTemplateService: MailTemplateService,
    private readonly smtpConfigService: SmtpConfigService
  ) {}

  async sendEmail(options: MailOptions): Promise<boolean> {
    try {
      // Set default from address if not provided
      if (!options.from) {
        options.from = this.smtpConfigService.defaultFromAddress;
      }

      const result = await this.mailProvider.sendMail(options);
      this.logger.log(`Email sent to ${options.to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }

  async sendTemplateEmail(
    to: string | string[],
    templateName: string,
    context: Record<string, any>,
    options: Partial<MailOptions> = {}
  ): Promise<boolean> {
    try {
      const { subject, html } = await this.mailTemplateService.compileTemplate(
        templateName,
        context
      );

      const mailOptions: MailOptions = {
        to,
        subject,
        html,
        ...options,
      };

      return this.sendEmail(mailOptions);
    } catch (error) {
      this.logger.error(
        `Failed to send template email ${templateName} to ${to}`,
        error.stack
      );
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    return this.mailProvider.verifyConnection();
  }
}
