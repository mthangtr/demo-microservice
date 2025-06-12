import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { MailTemplate } from '../../domain/models/mail-template.model';

@Injectable()
export class MailTemplateService {
  private readonly logger = new Logger(MailTemplateService.name);
  private readonly templates: Map<string, MailTemplate> = new Map();
  private readonly templatesDir = path.join(process.cwd(), 'apps/mail/src/app/mail/application/templates');

  constructor() {
    this.registerHelpers();
    this.registerTemplates();
  }

  private registerHelpers(): void {
    // Helper để nhân 2 số (tính subtotal)
    Handlebars.registerHelper('multiply', function(a, b) {
      return (parseFloat(a) * parseFloat(b)).toFixed(2);
    });

    // Helper để format số
    Handlebars.registerHelper('number', function(value) {
      return parseFloat(value).toFixed(2);
    });
  }

  private registerTemplates(): void {
    // Register all templates from the templates directory
    try {
      if (!fs.existsSync(this.templatesDir)) {
        fs.mkdirSync(this.templatesDir, { recursive: true });
      }

      // Register templates
      this.registerTemplate('welcome', 'Welcome to Our Platform', 'welcome.hbs');
      this.registerTemplate('password-reset', 'Password Reset Request', 'password-reset.hbs');
      this.registerTemplate('order-confirmation', 'Your Order Confirmation - Order #{{orderId}}', 'order-confirmation.hbs');
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
      // Check if template file exists
      if (!fs.existsSync(template.templatePath)) {
        throw new NotFoundException(`Template file ${template.templatePath} not found`);
      }

      const templateContent = fs.readFileSync(template.templatePath, 'utf-8');
      const compiledTemplate = Handlebars.compile(templateContent);
      const html = compiledTemplate(context);

      const compiledSubject = Handlebars.compile(template.subject);
      const subject = compiledSubject(context);

      return {
        subject,
        html,
      };
    } catch (error) {
      this.logger.error(`Failed to compile template ${templateName}`, error.stack);
      throw error;
    }
  }
}