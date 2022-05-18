import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '../users/entities/user';
import { OrderEntity } from './entities/order.entity';
import { LineItemEntity } from './entities/lineItem.entity';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(LineItemEntity)
    private readonly lineItemRepository: Repository<LineItemEntity>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: User,
  ): Promise<OrderEntity> {
    const order = new OrderEntity();
    order.user = user;
    order.lineItems = [];
    console.log(createOrderDto);

    createOrderDto.lineItems.forEach((lineItemData) => {
      const lineItem = new LineItemEntity();
      lineItem.order = order;
      lineItem.quantity = lineItemData.quantity;
      lineItem.product = lineItemData.productId;
      order.lineItems.push(lineItem);
    });
    return this.orderRepository.save(order);
  }

  async findAll(user: User): Promise<OrderEntity[]> {
    return this.orderRepository.find({
      where: { user },
      relations: ['lineItems', 'lineItems.product'],
    });
  }

  async findOne(id: number, user: User): Promise<OrderEntity | undefined> {
    return this.orderRepository.findOne(
      { id, user },
      {
        relations: [
          'lineItems',
          'lineItems.product',
          'lineItems.product.images',
        ],
      },
    );
  }

  async adjustQuantityOfLineItem(
    adjustQuantityDto: AdjustQuantityDto,
    orderId: number,
  ): Promise<UpdateResult> {
    return await this.lineItemRepository.update(
      { order: orderId as any, id: adjustQuantityDto.lineItemId },
      { quantity: adjustQuantityDto.quantity },
    );
  }
}
