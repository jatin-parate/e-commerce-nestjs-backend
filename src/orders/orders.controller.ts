import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user';
import { OrderEntity } from './entities/order.entity';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { OrderSerializer } from './serializers/order.serializer';

@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<OrderSerializer> {
    return new OrderSerializer(
      await this.ordersService.create(createOrderDto, req.user as User),
    );
  }

  @Get()
  async findAll(@Req() req: Request): Promise<OrderSerializer[]> {
    const orders = await this.ordersService.findAll(req.user as User);
    return orders.map((order) => new OrderSerializer(order));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<OrderEntity | undefined> {
    return this.ordersService.findOne(id, req.user as User);
  }

  @Put(':id/adjustQuantity')
  async adjustQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AdjustQuantityDto,
  ) {
    await this.ordersService.adjustQuantityOfLineItem(body, id);
  }
}
