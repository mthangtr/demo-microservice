# Mail Service

A simple microservice for handling email sending using SMTP in the e-commerce platform, designed for future Kafka integration.

## Features

- Send plain text and HTML emails
- Template-based emails using Handlebars templates
- Support for CC, BCC, and attachments
- Email template management
- Clean architecture with domain, application, and infrastructure layers
- Prepared for future Kafka integration

## Architecture

This service follows clean architecture principles:

- **Domain Layer**: Core business entities and interfaces
- **Application Layer**: Use cases and business logic
- **Infrastructure Layer**: External interfaces, framework-specific code, and providers

## Setup

1. Copy `.env.example` to `.env` and configure your SMTP settings:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM_ADDRESS=noreply@example.com
SMTP_FROM_NAME=Your Application Name
```

2. Install dependencies:

```bash
npm install nodemailer handlebars @types/nodemailer
```

3. Run the service:

```bash
nx serve mail
```

## Email Templates

Email templates are stored in `src/assets/templates` as Handlebars (`.hbs`) files. The service comes with three default templates:

- `welcome.hbs`: Welcome email for new users
- `password-reset.hbs`: Password reset instructions
- `order-confirmation.hbs`: Order confirmation details

## REST API Endpoints

The service exposes the following REST endpoints:

### POST /api/mail/send

Send a basic email:

```json
{
  "to": "user@example.com",
  "subject": "Hello",
  "text": "This is a plain text email",
  "html": "<p>This is an HTML email</p>"
}
```

### POST /api/mail/send-template

Send an email using a template:

```json
{
  "to": "user@example.com",
  "templateName": "welcome",
  "context": {
    "name": "John",
    "email": "user@example.com",
    "year": "2025"
  }
}
```

### GET /api/mail/verify

Verify SMTP connection.

### GET /api/mail/health

Health check endpoint.

## Future Kafka Integration

The service is structured to easily integrate with Kafka. The placeholder files for Kafka implementation are:

- `infrastructure/kafka/mail-kafka.listener.ts` - Contains message handlers
- `infrastructure/config/kafka-config.service.ts` - Kafka configuration

When ready to implement Kafka:

1. Uncomment Kafka environment variables in `.env`
2. Implement a Kafka module or use the NestJS Kafka microservice transport
3. Update the existing Kafka listeners with proper decorators

## Adding New Templates

1. Create a new `.hbs` file in `src/assets/templates/`
2. Register the template in `MailTemplateService`:

```typescript
this.registerTemplate('template-name', 'Email Subject', 'template-filename.hbs');
```

## License

This project is part of the e-commerce microservices platform.
