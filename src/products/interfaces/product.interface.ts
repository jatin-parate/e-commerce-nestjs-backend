export interface IProductData {
  name: string;
  price: number;
  description: string;
  deletedAt?: Date;
  isActive: boolean;
  isBestSeller: boolean;
}

export interface IProduct extends IProductData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
