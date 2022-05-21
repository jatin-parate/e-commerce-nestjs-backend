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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import fs from 'fs';

import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dtos/create-product-image.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../products/products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3Service } from 'src/s3/s3.service';

@Controller('products/:productId/product-images')
@ApiTags('Product Images')
export class ProductImagesController {
  constructor(
    private readonly productImagesService: ProductImagesService,
    private readonly productsService: ProductsService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async getAll(@Param('productId', ParseIntPipe) productId: number) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId, [
      'images',
    ]);
    return product!.images;
  }

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() body: CreateProductImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const product = await this.productsService.getByIdEvenIfDeleted(productId);
    if (!product) {
      if (file.path) {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      throw new NotFoundException('Product not found');
    }

    await this.productImagesService.addNewImageToProduct(product, body, file);
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
