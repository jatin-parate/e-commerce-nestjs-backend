import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAll(): Promise<any> {
    return await this.productsService.findAllActiveAndNonDeleted();
  }

  @Post('')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  async create(@Body() body: any): Promise<any> {
    return await this.productsService.create(body);
  }
}
