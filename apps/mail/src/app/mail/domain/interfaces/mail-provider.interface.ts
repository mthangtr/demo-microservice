import { MailOptions } from '../models/mail-options.model';

export interface IMailProvider {
  sendMail(options: MailOptions): Promise<boolean>;
  verifyConnection(): Promise<boolean>;
}
