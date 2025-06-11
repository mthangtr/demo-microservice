import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { MailTemplate } from '../../domain/models/mail-template.model';

@Injectable()
export class MailTemplateService {
  private readonly logger = new Logger(MailTemplateService.name);
  private readonly templates: Map<string, MailTemplate> = new Map();
  private readonly templatesDir = path.join(process.cwd(), 'apps/mail/src/assets/templates');

  constructor() {
    this.registerTemplates();
  }

  private registerTemplates(): void {
    // Register all templates from the templates directory
    try {
      if (!fs.existsSync(this.templatesDir)) {
        fs.mkdirSync(this.templatesDir, { recursive: true });
      }

      // Example template registration
      this.registerTemplate('welcome', 'Welcome to Our Platform', 'welcome.hbs');
      this.registerTemplate('password-reset', 'Password Reset Request', 'password-reset.hbs');
      this.registerTemplate('order-confirmation', 'Order Confirmation', 'order-confirmation.hbs');
    } catch (error) {
      this.logger.error('Failed to register templates', error.stack);
    }
  }

  private registerTemplate(name: string, subject: string, templateFile: string): void {
    this.templates.set(name, {
      name,
      subject,
      templatePath: path.join(this.templatesDir, templateFile),
    });
  }

  async compileTemplate(
    templateName: string,
    context: Record<string, any>
  ): Promise<{ subject: string; html: string }> {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new NotFoundException(`Template ${templateName} not found`);
    }

    try {
      // Create template file if it doesn't exist (for development purposes)
      if (!fs.existsSync(template.templatePath)) {
        const dir = path.dirname(template.templatePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(template.templatePath, this.getDefaultTemplate(templateName));
      }

      const templateContent = fs.readFileSync(template.templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const html = compiledTemplate(context);

      return {
        subject: template.subject,
        html,
      };
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}`, error.stack);
      throw error;
    }
  }

  private getDefaultTemplate(templateName: string): string {
    switch (templateName) {
      case 'welcome':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Our Platform</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome, {{name}}!</h1>
    </div>
    <div class="content">
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>Your account has been created successfully and is ready to use.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} Our Company. All rights reserved.</p>
      <p>This email was sent to {{email}}</p>
    </div>
  </div>
</body>
</html>`;

      case 'password-reset':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2196F3; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>We received a request to reset your password. Please click the button below to create a new password:</p>
      <p style="text-align: center;">
        <a href="{{resetLink}}" class="button">Reset Password</a>
      </p>
      <p>If you didn't request a password reset, you can ignore this email - your password will not be changed.</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} Our Company. All rights reserved.</p>
      <p>This email was sent to {{email}}</p>
    </div>
  </div>
</body>
</html>`;

      case 'order-confirmation':
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #FF9800; color: white; padding: 10px; text-align: center; }
    .content { padding: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    .footer { font-size: 12px; text-align: center; margin-top: 20px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      <p>Thank you for your order! We've received your purchase and are processing it now.</p>
      <p><strong>Order Number:</strong> {{orderNumber}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>

      <h3>Order Summary:</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {{#each items}}
          <tr>
            <td>{{this.name}}</td>
            <td>{{this.quantity}}</td>
            <td>this.price</td>
          </tr>
          {{/each}}
          <tr>
            <td colspan="2"><strong>Total</strong></td>
            <td><strong>this.total</strong></td>
          </tr>
        </tbody>
      </table>

      <p>We'll notify you when your order ships.</p>
      <p>Best regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>© {{year}} Our Company. All rights reserved.</p>
      <p>This email was sent to {{email}}</p>
    </div>
  </div>
</body>
</html>`;

      default:
        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Default Template</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>{{title}}</h1>
      <p>{{message}}</p>
    </div>
  </div>
</body>
</html>`;
    }
  }
}
