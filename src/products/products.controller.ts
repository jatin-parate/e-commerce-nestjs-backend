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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OnlyAdminGuard } from '../guards/only-admin.guard';
import { CreateProductDto } from './dtos/create-product.dto';
import {
  GetAllProductsQueryDto,
  SortDirection,
} from './dtos/get-all-products-query.dto';
import { ProductsService } from './products.service';
import { Product } from './entities/product';
import UpdateProductBodyDto from './dtos/update-product-body.dto';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('')
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    enum: SortDirection,
  })
  async getAll(@Query() query: GetAllProductsQueryDto): Promise<Product[]> {
    return await this.productsService.findAll(query);
  }

  @Post('')
  @UseGuards(JwtAuthGuard, OnlyAdminGuard)
  @ApiBearerAuth()
  async create(@Body() body: CreateProductDto): Promise<any> {
    return await this.productsService.create(body);
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
  async updateById(
    @Body() body: UpdateProductBodyDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Product> {
    const product = await this.productsService.getByIdEvenIfDeleted(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return await this.productsService.update(product, body.product);
  }
}
