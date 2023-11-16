import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<Product>) {}

  async create(productDto: ProductDto): Promise<Product> {
    const createdProduct = new this.productModel(productDto);
    return createdProduct.save();
  }
}