import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Product extends Document {
  @Prop()
  name: string;

  //@Prop()
  //price: any;
  // Add other properties as needed
}

export const ProductSchema = SchemaFactory.createForClass(Product);