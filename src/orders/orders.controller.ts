import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { GetAllOrdersOptions } from './dto/get-all-orders-options.dto';

@Controller('orders')
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return this.ordersService.create(createOrderDto, req.user!);
  }

  @Put(':orderId/adjustQuantity')
  async adjustQuantity(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() body: AdjustQuantityDto,
  ) {
    return this.ordersService.adjustQuantity(orderId, body);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: GetAllOrdersOptions) {
    return this.ordersService.findAll(req.user!, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }
}
