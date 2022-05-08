import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  async getAll(@Query('search') productName?: string): Promise<any> {
    return await this.productsService.findAllActiveAndNonDeleted(productName);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  async create(@Body() body: CreateProductDto): Promise<any> {
    return await this.productsService.create(body);
  }
}
