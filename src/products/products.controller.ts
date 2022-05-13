import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { GetAllProductsQueryDto } from './dtos/get-all-products-query.dto';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getAll(@Query() query: GetAllProductsQueryDto): Promise<any> {
    return await this.productsService.findAll(query.isActive, query.search);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  async create(@Body() body: CreateProductDto): Promise<any> {
    return await this.productsService.create(body);
  }
}
