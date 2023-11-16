import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

class Variant {
  @Prop()
  description: string;

  @Prop()
  packaging: string;
}

class Value {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop()
  value: string;
}

class Option {
  @Prop()
  id: string;

  @Prop()
  name: string;

  @Prop({ type: [Value], default: [] })
  values: Value[];
}

class ProductData {
  @Prop()
  name: string;

  @Prop()
  vendorId: string;

  @Prop()
  manufacturerId: string;

  @Prop()
  description: string;

  @Prop({ type: [Variant], default: [] })
  variants: Variant[];

  @Prop({ type: [Option], default: [] })
  options: Option[];
}

@Schema()
export class Product {
  @Prop({ required: true, unique: true })
  docId: string;

  @Prop({ type: ProductData, default: {} })
  data: ProductData;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
