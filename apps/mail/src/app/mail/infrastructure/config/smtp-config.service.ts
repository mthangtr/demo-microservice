import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmtpConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('SMTP_HOST') || 'smtp.example.com';
  }

  get port(): number {
    return parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);
  }

  get secure(): boolean {
    return this.configService.get<string>('SMTP_SECURE') === 'true';
  }

  get user(): string {
    return this.configService.get<string>('SMTP_USER') || '';
  }

  get password(): string {
    return this.configService.get<string>('SMTP_PASSWORD') || '';
  }

  get defaultFromAddress(): string {
    return (
      this.configService.get<string>('SMTP_FROM_ADDRESS') ||
      'noreply@example.com'
    );
  }

  get defaultFromName(): string {
    return (
      this.configService.get<string>('SMTP_FROM_NAME') || 
      'Your Application'
    );
  }
}
