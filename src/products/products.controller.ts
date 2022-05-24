import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import { GetAllProductsQueryDto } from './dtos/get-all-products-query.dto';
import { ProductsService } from './products.service';
import UpdateProductBodyDto from './dtos/update-product-body.dto';
import { GetAllProductResponse } from './responses/get-products.response';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  @ApiResponse({ type: GetAllProductResponse, status: 200, isArray: true })
  async getAll(
    @Query() query: GetAllProductsQueryDto,
  ): Promise<GetAllProductResponse[]> {
    const products = await this.productsService.findAll(query);

    return products.map((product) => new GetAllProductResponse(product));
  }

  @Post('')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: GetAllProductResponse, status: 201 })
  async create(@Body() body: CreateProductDto): Promise<GetAllProductResponse> {
    const product = await this.productsService.create(body);
    return new GetAllProductResponse(product);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const product = await this.productsService.getNonDeletedById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productsService.deleteProduct(product);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: GetAllProductResponse, status: 200 })
  async updateById(
    @Body() body: UpdateProductBodyDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<GetAllProductResponse> {
    const updatedProduct = await this.productsService.update(id, body.product);
    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }
    return new GetAllProductResponse(updatedProduct);
  }
}
