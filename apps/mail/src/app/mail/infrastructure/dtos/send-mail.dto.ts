import { IsString, IsOptional, IsObject, IsEmail, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMailDto {
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  to: string;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  cc?: string;

  @IsOptional()
  @IsString()
  bcc?: string;
}

export class SendTemplateMailDto {
  @IsString()
  to: string;

  @IsString()
  templateName: string;

  @IsObject()
  context: Record<string, any>;

  @IsOptional()
  @IsString()
  cc?: string;

  @IsOptional()
  @IsString()
  bcc?: string;
}
