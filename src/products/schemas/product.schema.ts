import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true, unique: true })
  docId: string;

  //   @Prop({ required: true })
  //   name: string;

  @Prop({ required: false })
  description: string;

  //   @Prop({ required: true })
  //   vendorId: string;

  //   @Prop({ required: true })
  //   manufacturerId: string;

  //   @Prop({ type: [String], default: [] })
  //   variants: string[];

  //   @Prop({ type: [String], default: [] })
  //   options: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
