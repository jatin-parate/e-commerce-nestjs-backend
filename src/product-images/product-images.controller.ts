import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../products/products.service';

@Controller('products/:productId/product-images')
@ApiTags('Product Images')
export class ProductImagesController {
  constructor(
    private readonly productImagesService: ProductImagesService,
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateProductImageDto,
  ) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId);
    if (product.image) {
      throw new BadRequestException('Product already has an image');
    }
    return this.productImagesService.create(product, body);
  }

  @Delete()
  async remove(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId);
    if (!product.image) {
      return;
    }
    return this.productImagesService.remove(product.image);
  }
}
