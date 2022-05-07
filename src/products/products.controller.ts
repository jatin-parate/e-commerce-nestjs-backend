import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  async findAll(): Promise<any> {
    return await this.productsService.findAll();
  }

  @Post('')
  async create(@Body() body: any): Promise<any> {
    return await this.productsService.create(body);
  }
}
