import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  Body,
  NotFoundException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../products/products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';

@Controller('products/:productId/product-images')
@ApiTags('Product Images')
export class ProductImagesController {
  constructor(
    private readonly productImagesService: ProductImagesService,
    private readonly productsService: ProductsService,
  ) {}

  @Get()
  async getAll(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId, [
      'images',
    ]);
    return product.images;
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateProductImageDto,
  ) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productImagesService.addNewImageToProduct(product, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  async removeById(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.productImagesService.removeById(id);
  }
}
