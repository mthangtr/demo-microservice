import { IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CartItemDto {
    @IsString()
    productId: string | undefined;

    @IsNumber()
    quantity: number | undefined;
}

export class CreateCartDto {
    @IsString()
    userId: string | undefined;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CartItemDto)
    items: CartItemDto[] | undefined;
}
