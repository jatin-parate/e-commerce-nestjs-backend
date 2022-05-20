import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/users/entities/user';
import { Repository } from 'typeorm';
import { AdjustQuantityDto } from './dto/adjust-quantity.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetAllOrdersOptions } from './dto/get-all-orders-options.dto';
import { LineItem } from './entities/line-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(LineItem)
    private readonly lineItemsRepo: Repository<LineItem>,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {
    const productIds = createOrderDto.lineItems.reduce((prev, curr) => {
      let quantity = prev.get(curr.productId) ?? 0;
      quantity += curr.quantity;
      prev.set(curr.productId, quantity);
      return prev;
    }, new Map<number, number>());
    const lineItems = await Promise.all(
      [...productIds.entries()].map(async ([productId, quantity]) => {
        const product = await this.productsService.getNonDeletedById(productId);
        return this.lineItemsRepo.create({
          product,
          quantity,
          unitPrice: product.price,
        });
      }),
    );
    const order = this.ordersRepo.create({
      user,
      lineItems,
    });
    return await this.ordersRepo.save(order);
  }

  async adjustQuantity(orderId: number, adjustQuantityDto: AdjustQuantityDto) {
    if (adjustQuantityDto.quantity === 0) {
      await this.lineItemsRepo.delete({ id: adjustQuantityDto.lineItemId });
      return;
    }

    let lineItem = await this.lineItemsRepo.findOne({
      id: adjustQuantityDto.lineItemId,
      order: orderId,
    });

    if (!lineItem) {
      const product = await this.productsService.getNonDeletedById(
        adjustQuantityDto.lineItemId,
      );
      lineItem = this.lineItemsRepo.create({
        order: orderId,
        product,
        unitPrice: product.price,
      });
    }

    lineItem.quantity = adjustQuantityDto.quantity;

    return await this.lineItemsRepo.save(lineItem);
  }

  async findAll(user: User, findOptions: GetAllOrdersOptions) {
    return await this.ordersRepo.find({
      where: { user },
      relations: ['lineItems'],
      take: findOptions.limit,
      skip: (findOptions.page - 1) * findOptions.limit,
    });
  }

  async findOne(id: number) {
    return await this.ordersRepo.findOne(id, {
      relations: ['lineItems', 'lineItems.product'],
    });
  }
}
