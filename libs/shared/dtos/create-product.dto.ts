import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProductDto {
    @IsString()
    name: string | undefined;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNumber()
    price: number | undefined;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsNumber()
    inStock?: number;

    @IsOptional()
    @IsString()
    category?: string;
}
