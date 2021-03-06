import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product';
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
        const lineItem = this.lineItemsRepo.create({
          product,
          quantity,
          unitPrice: product!.price,
        });

        return lineItem;
      }),
    );
    const quantityUpdateData: { [productId: string]: number } = {};
    for (const lineItem of lineItems) {
      const productId = (lineItem.product as Product).id.toString();
      const quantity = -lineItem.quantity;
      quantityUpdateData[productId] = quantity;
    }

    let savedOrder: Order;
    await this.productsService.updateManyQuantities(
      quantityUpdateData,
      async (entityManager) => {
        const order = this.ordersRepo.create({
          user,
          lineItems,
        });

        savedOrder = await entityManager.save(order);
        return savedOrder;
      },
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return savedOrder;
  }

  async adjustQuantity(
    orderId: number,
    adjustQuantityDto: AdjustQuantityDto,
  ): Promise<Optional<LineItem>> {
    let lineItem = await this.lineItemsRepo.findOne({
      id: adjustQuantityDto.lineItemId,
      order: orderId,
    });

    if (!lineItem) {
      throw new NotFoundException('Line item not found!');
    }

    await this.productsService.updateManyQuantities(
      {
        [lineItem.product as number]: adjustQuantityDto.quantity,
      },
      async (entityManager) => {
        if (lineItem!.quantity + adjustQuantityDto.quantity <= 0) {
          await entityManager.delete(LineItem, lineItem!.id);
          lineItem = undefined;
        } else {
          lineItem!.quantity += adjustQuantityDto.quantity;
          lineItem = await entityManager.save(lineItem);
        }
      },
    );

    return lineItem;
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
